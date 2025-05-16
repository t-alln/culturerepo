import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ModerationResult {
  status: string;
  confidence: string;
  feedback: string;
  rejected: boolean;
}

// Use LLM to analyze content with a lenient approach
async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    // Instructive prompt for lenient moderation like Urban Dictionary
    const moderationPrompt = `
You are analyzing content for a visual slang dictionary site similar to Urban Dictionary. 
This site allows adult content and risqué language. Your job is to be LENIENT and only identify 
truly harmful content.

Content to analyze:
"""
${text}
"""

DO NOT REJECT content unless it contains very explicit illegal activities or extremely harmful content.
Be permissive with risqué, adult, or provocative language - this is expected on the platform.

Please analyze the content and return ONLY a JSON object with these fields:
1. status: (Must be exactly "APPROVED", "FLAGGED", or "REJECTED")
   - APPROVED: For most content, even if adult-oriented or risqué (DEFAULT CHOICE)
   - FLAGGED: For questionable but not clearly harmful content
   - REJECTED: ONLY for clearly illegal or extremely harmful content
2. confidence: (Must be exactly "HIGH", "MEDIUM", or "LOW")
3. feedback: A brief reason for your decision
4. rejected: (Must be exactly true or false, should be false in almost all cases)

Format the response as valid JSON only, without any other text or commentary.
`;

    // Configure the request to Replicate
    const input = {
      prompt: moderationPrompt,
      temperature: 0.2, // Low temperature for more consistent responses
      max_new_tokens: 500,
      prompt_template:
        "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful, precise assistant that only outputs JSON when analyzing content.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
    };

    // Call the model
    let response = "";
    for await (const event of replicate.stream(
      "meta/meta-llama-3-70b-instruct",
      { input }
    )) {
      response += event;
    }

    // Parse the JSON response
    let result: ModerationResult;
    try {
      // Clean up the response to extract just the JSON part
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : null;

      if (!jsonStr) {
        throw new Error("Could not parse JSON from model response");
      }

      result = JSON.parse(jsonStr);

      // Ensure required fields exist with correct formatting
      result.status = ["APPROVED", "FLAGGED", "REJECTED"].includes(
        result.status
      )
        ? result.status
        : "APPROVED";

      result.confidence = ["HIGH", "MEDIUM", "LOW"].includes(result.confidence)
        ? result.confidence
        : "MEDIUM";

      result.rejected = result.status === "REJECTED";

      if (!result.feedback) {
        result.feedback = "Content reviewed with lenient standards.";
      }
    } catch (parseError) {
      console.error("Error parsing model response:", parseError);
      // Fallback to approved by default in case of parsing error
      result = {
        status: "APPROVED",
        confidence: "MEDIUM",
        feedback: "Default approval due to parsing error.",
        rejected: false,
      };
    }

    return result;
  } catch (error) {
    console.error("Error during content moderation:", error);
    // Fail open - if the moderation service fails, we approve by default
    return {
      status: "APPROVED",
      confidence: "LOW",
      feedback: "Default approval due to service error.",
      rejected: false,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const term = formData.get("term") as string | null;
    const description = formData.get("description") as string | null;

    if (!term) {
      return NextResponse.json({ error: "Term is required" }, { status: 400 });
    }

    // Combine text for moderation
    const textToModerate = [term, description || ""].filter(Boolean).join("\n");

    // Moderate the content using our lenient approach
    const result = await moderateContent(textToModerate);

    // Log for review during development
    if (process.env.NODE_ENV === "development") {
      console.log("Moderation result:", result);
    }

    // Indicate to client that we processed file (even though we're not analyzing it yet)
    if (file) {
      console.log(`File "${file.name}" received but not analyzed`);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in moderation check:", error);
    return NextResponse.json(
      {
        status: "APPROVED",
        confidence: "LOW",
        feedback: "Automatic approval due to system error.",
        rejected: false,
      },
      { status: 200 } // Still return 200 to allow content through
    );
  }
}
