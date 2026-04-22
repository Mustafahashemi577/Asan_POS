import { z } from "zod";

export const editProfileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dob: z.string().optional(),
    storeName: z.string().optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If one password field is filled, both must be filled
      if (data.oldPassword && !data.newPassword) return false;
      if (data.newPassword && !data.oldPassword) return false;
      return true;
    },
    {
      message: "Both old and new password are required to change password",
      path: ["newPassword"],
    },
  );

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
