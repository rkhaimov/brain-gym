import { z } from "zod";
import { Schema } from "../types";

export const BloodPressureMeasurementSchema = {
  name: "blood-pressure-measurement",
  schema: z
    .object({
      sys: z.int().describe("Systolic blood pressure in mmHg."),
      dia: z.int().describe("Diastolic blood pressure in mmHg."),
      pulse: z.int().describe("Pulse measured by the blood-pressure monitor in beats per minute."),
      notes: z.string().optional().describe("Short optional note describing unusual events."),
    })
    .describe("Stores one blood-pressure measurement per row."),
} satisfies Schema;
