import { db } from "../../../lib/db/src";
import { savedRotas } from "../../../lib/db/src/schema";
import { createSavedRota } from "../../../lib/rota-engine/src/savedRota";

import { openai } from "@workspace/integrations-openai-ai-server";
import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

const StaffMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  contractedHours: z.number(),
  role: z.string(),
});

const GenerateRotaRequestSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  team: z.string().optional(),
  staff: z.array(StaffMemberSchema).min(1),
  minDayCoverage: z.number().min(0).max(20).default(2),
  minDaySleepCoverage: z.number().min(0).max(20).default(2),
  minNightCoverage: z.number().min(0).max(20).default(2),
  notes: z.string().optional(),
  existingShifts: z
    .array(
      z.object({
        staffId: z.string(),
        date: z.string(),
        shiftType: z.string(),
      })
    )
    .optional(),
});

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

router.post("/generate", async (req: Request, res: Response) => {
  const parsed = GenerateRotaRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const {
    month,
    year,
    staff,
    minDayCoverage,
    minDaySleepCoverage,
    minNightCoverage,
    notes,
    existingShifts,
  } = parsed.data;

  const daysInMonth = getDaysInMonth(year, month);
  const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
  });

  const systemPrompt = `You are a healthcare rota scheduling expert for a support worker company. You generate fair, legally compliant shift schedules.

SHIFT TYPES:
- D: Full Day shift (08:00-20:00, 12 hours)
- DS: Day Sleep shift (08:00-23:00, 15 hours)
- N: Nightshift (20:00-08:00, 12 hours)
- T: Training day
- AL: Annual Leave (already pre-assigned, do not change)
- OFF: Rest day (no work)

RULES:
1. Meet minimum daily coverage: at least ${minDayCoverage} D shifts, ${minDaySleepCoverage} DS shifts, and ${minNightCoverage} N shifts every day
2. Each staff member's total working hours should stay close to their contracted monthly hours
3. Maximum 5 consecutive working days — enforce mandatory rest
4. Nights should be distributed fairly; avoid giving all nights to one person
5. After a Night shift, staff must have a rest day (OFF) before working again
6. DS (Day Sleep) ends at 23:00 — staff cannot do a D or DS shift the following day
7. Pre-existing AL shifts cannot be changed
8. Return ONLY valid JSON with no markdown or extra text
${existingShifts && existingShifts.length > 0 ? `\nPRE-ASSIGNED SHIFTS (must keep exactly as-is):\n${JSON.stringify(existingShifts, null, 2)}` : ""}
${notes ? `\nMANAGER NOTES: ${notes}` : ""}`;

  const userPrompt = `Generate a complete rota for ${monthName} ${year} (${daysInMonth} days).

Staff (${staff.length} members):
${staff.map((s) => `- ID: "${s.id}" | Name: ${s.name} | Contract: ${s.contractedHours}h/month | Role: ${s.role}`).join("\n")}

Return a JSON object with this exact structure:
{
  "shifts": [
    { "staffId": "<id>", "date": "YYYY-MM-DD", "shiftType": "D|DS|N|T|AL|OFF", "hours": <number> }
  ],
  "summary": "<1-2 sentence summary of the rota>",
  "warnings": ["<any scheduling conflicts or notes>"]
}

Hours per shiftType: D=12, DS=15, N=12, T=7.5, AL=0, OFF=0
Assign a shift entry for EVERY staff member for EVERY day of the month (${daysInMonth} days × ${staff.length} staff = ${daysInMonth * staff.length} total entries).`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: "No response from AI" });
    }

    const result = JSON.parse(content);
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating rota");
    return res
      .status(500)
      .json({ error: "Failed to generate rota. Please try again." });
  }
});

export default router;

import { generateWeeklyRota } from "../../../lib/rota-engine/src/generateWeeklyRota";
import { validateWeeklyRota } from "../../../lib/rota-engine/src/validateRota";

router.post("/generate-auto", async (req, res) => {
  try {
    const { startDate, staff, support } = req.body;

    if (!startDate || !staff || !support) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const rota = generateWeeklyRota(startDate, staff, support);
    const validation = validateWeeklyRota(rota);

    return res.json({ rota, validation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate auto rota" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { rota, status } = req.body;

    if (!rota) {
      return res.status(400).json({ error: "No rota provided" });
    }

    // For now we just simulate saving
    // Later we connect to database

    return res.json({
      message: "Rota saved successfully",
      data: {
        rota,
        status: status || "draft",
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to save rota" });
  }
});
router.post("/save", async (req, res) => {
  try {
    const { clientId, startDate, endDate, rota, status } = req.body;

    if (!clientId || !startDate || !endDate || !rota) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["clientId", "startDate", "endDate", "rota"],
      });
    }

    const savedRota = createSavedRota({
      clientId,
      startDate,
      endDate,
      rota,
      status: status || "draft",
    });

    await db.insert(savedRotas).values(savedRota);

    return res.status(201).json({
      message: "Rota saved successfully",
      rota: savedRota,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to save rota",
    });
  }
});

