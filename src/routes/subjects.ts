import { and, eq, desc, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const {search, department, page = 1, limit = 10} = req.query
    const currentPage = Math.max(1, parseInt(page as string, 10) || 1);
    const limitPerPage = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const offset = (currentPage - 1) * limitPerPage;

    // Input validation
    const searchTerm = typeof search === 'string' ? search.trim().slice(0, 100) : undefined;
    const departmentCode = typeof department === 'string' ? department.trim().slice(0, 50) : undefined;

    const filterConditions = []

    if (searchTerm && searchTerm.length > 0) {
      filterConditions.push(
        or (
          ilike(subjects.name, `%${searchTerm}%`),
          ilike(subjects.code, `%${searchTerm}%`)
        )
      )
    }

    if (departmentCode && departmentCode.length > 0) {
      filterConditions.push(
        eq(departments.code, departmentCode)
      )
    }

    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined

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