export function validateLead(data) {
  if (!data.title || data.title.trim() === "") {
    return "Please enter a title";
  }
  if (!data.description || data.description.trim() === "") {
    return "Please enter a description";
  }
  if (!["New", "Contacted", "Converted", "Lost"].includes(data.status)) {
    return "Please select a valid status";
  }
  if (isNaN(data.value) || Number(data.value) < 0) {
    return "Please enter a valid lead value";
  }
  return null;
}
