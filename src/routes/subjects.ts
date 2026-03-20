import { and, eq, desc, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const {search, department, page = 1, limit = 10} = req.query
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;

    const filterCOnditions = []

    if (search) {
      filterCOnditions.push(
        or (
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      )
    }

    if (department) {
      filterCOnditions.push(
        ilike(departments.name, `%${department}%`)
      )
    }

    const whereClause = filterCOnditions.length > 0 ? and(...filterCOnditions) : undefined

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
    
    const totalCount = countResult[0]?.count ?? 0

    const subjectsList = await db
      .select({ 
        ...getTableColumns(subjects), 
        department: { 
          ...getTableColumns(departments) 
        }
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset)

    res.status(200).json({
      data: subjectsList,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: limitPerPage,
        totalPages: Math.ceil(totalCount / limitPerPage),
      }
    })
  } catch (error) {
    console.error("Error handling /subjects request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

export default router