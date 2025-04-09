import { promises as fs } from "fs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Read the JSON file from the file system
    const file = await fs.readFile(process.cwd() + "/data/digimon.json", "utf8")
    const data = JSON.parse(file)

    // Return the data as JSON
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error reading digimon data:", error)
    return NextResponse.json({ error: "Failed to load digimon data" }, { status: 500 })
  }
}
