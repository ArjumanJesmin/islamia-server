import { UserRole } from "@prisma/client";

import * as bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";


interface AdminPayload {
  admin: {
    email: string;
    name: string;
  };
  password: string;
}

const createAdmin = async (payload: AdminPayload) => {
  if (!payload.admin || !payload.admin.email || !payload.admin.name || !payload.password) {
    throw new Error("Admin email, name, and password are required");
  }

  const hashPassword: string = await bcrypt.hash(payload.password, 12);
  
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: payload.admin.email,
        password: hashPassword,
        role: UserRole.ADMIN,
      },
    });

    // Then create the admin profile
    const createdAdminData = await tx.admin.create({
      data: {
        email: payload.admin.email,
        name: payload.admin.name,

        user: {
          connect: {
            id: user.id
          }
        }
      },
    });
    
    return createdAdminData;
  });

  return result;
};




  const createTeacher = async (payload: any) => {
    if (!payload.teacher?.email || !payload.password) {
      throw new Error("শিক্ষকের ইমেল বা পাসওয়ার্ড অনুপস্থিত");
    }

    // 🔐 Password hash
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: payload.teacher.email,
          password: hashedPassword,
          role: UserRole.TEACHER,
        },
      });

      // 🏫 Step 2: Create Teacher Profile
      const createdTeacher = await tx.teacher.create({
        data: {
          name: payload.teacher.name,
          position: payload.teacher.position,
          qualification: payload.teacher.qualification,
          bio: payload.teacher.bio,
          email: payload.teacher.email,
          phone: payload.teacher.phone,
          image: payload.teacher.image,
          user: {
            connect: { id: createdUser.id },
          },
        },
      });

      return createdTeacher;
    });

    return result;
  }



export const UserService = {
  createAdmin,
  createTeacher,
};