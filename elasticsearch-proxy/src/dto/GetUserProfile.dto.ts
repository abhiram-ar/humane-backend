import { z } from "zod";

export const getUserProfileSchema= z.string().nonempty()