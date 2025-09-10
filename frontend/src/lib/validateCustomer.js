export function validateCustomer(data) {
  const errors = [];

  // Name
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters.");
  }

  // Email
  if (!data.email) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format.");
  }

  // Phone
  if (!data.phone) {
    errors.push("Phone is required.");
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.push("Please enter a valid 10-digit phone number.");
  } else if (!/^[0-9]{10}$/.test(data.phone)) {
    errors.push("Phone must be 10 digits.");
  }

  // Company (optional but can be validated)
  if (data.company && data.company.length < 2) {
    errors.push("Company name must be at least 2 characters.");
  }

  return errors;
}
