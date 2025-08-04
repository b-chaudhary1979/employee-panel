import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useAssignmentCreator(companyId) {
  const createAssignment = async (employeeIds, assignmentData) => {
    if (!companyId) throw new Error("Company ID is missing");
    for (const empId of employeeIds.filter(id => id.trim())) {
      await addDoc(
        collection(db, "users", companyId, "employees", empId, "assignments"),
        assignmentData
      );
    }
  };
  return { createAssignment };
}