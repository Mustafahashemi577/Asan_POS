import { z } from "zod";

export const editProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    gender: z
      .enum(["male", "female", "other", "prefer_not_to_say", ""])
      .optional(),
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
