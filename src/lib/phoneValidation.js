/**
 * Validates a mobile / phone number.
 * Supports:
 * - 10-digit mobile numbers (starting with 6, 7, 8, 9)
 * - Numbers with country code prefix like +91 or 91
 * - Standard international phone numbers with + (10 to 15 digits)
 * 
 * Returns { isValid: boolean, message: string, formatted: string }
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: "Phone number is required." };
  }

  const cleaned = phone.trim().replace(/[\s-]/g, "");

  // If starts with +91
  if (cleaned.startsWith("+91")) {
    const rest = cleaned.slice(3);
    if (!/^[6-9]\d{9}$/.test(rest)) {
      return {
        isValid: false,
        message: "Please enter a valid 10-digit mobile number starting with 6-9 after +91."
      };
    }
    return { isValid: true, message: "", formatted: cleaned };
  }

  // If starts with general international +
  if (cleaned.startsWith("+")) {
    const digitsOnly = cleaned.slice(1);
    if (!/^\d{10,14}$/.test(digitsOnly)) {
      return {
        isValid: false,
        message: "International number must have 10 to 15 digits including country code."
      };
    }
    return { isValid: true, message: "", formatted: cleaned };
  }

  // If starts with 91 followed by 10 digits
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, message: "", formatted: `+${cleaned}` };
  }

  // If standard 10 digit number
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: true, message: "", formatted: cleaned };
  }

  // Helpful targeted feedback
  if (/^\d+$/.test(cleaned)) {
    if (cleaned.length < 10) {
      return {
        isValid: false,
        message: `Phone number is too short (${cleaned.length}/10 digits).`
      };
    }
    if (cleaned.length > 10) {
      return {
        isValid: false,
        message: `Phone number is too long (${cleaned.length} digits). A valid mobile number must be 10 digits.`
      };
    }
    if (!/^[6-9]/.test(cleaned)) {
      return {
        isValid: false,
        message: "Mobile number should begin with 6, 7, 8, or 9."
      };
    }
  }

  return {
    isValid: false,
    message: "Please enter a valid 10-digit phone number."
  };
};

/**
 * Sanitizes phone input while typing (allows only digits, +, space, -; max 15 digits).
 */
export const sanitizePhoneInput = (val) => {
  if (!val) return "";
  let filtered = val.replace(/[^\d+\s-]/g, "");
  if (filtered.indexOf("+") > 0) {
    filtered = filtered.replace(/\+/g, "");
  }
  return filtered.slice(0, 16);
};

