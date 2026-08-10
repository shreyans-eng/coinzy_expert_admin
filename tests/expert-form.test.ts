import { describe, expect, it } from "vitest";
import {
  buildCreateExpertBody,
  buildUpdateExpertBody,
  canSetExpertStatus,
  clampOneLineDescription,
  normalizeYearsOfXp,
  optionalProfileString,
  parseExpertiseChips,
  parseSupportedCountries,
  serializeExpertiseChips,
  validateExpertProfileForm,
  yearsOfXpInputValue,
} from "@/lib/expert-form";

const baseForm = {
  name: "Expert One",
  email: "expert@example.com",
  password: "secret",
  confirmPassword: "secret",
  supportedCountries: "in, gb",
  profilePicture: "https://media.example.com/a.jpg",
  oneLineDescription: " Specialist ",
  yearsOfXp: "12",
  expertise: "Ancient coins, British India",
};

describe("expert-form", () => {
  it("parses supported countries and treats blank as all countries", () => {
    expect(parseSupportedCountries("in, gb, in")).toEqual(["IN", "GB", "IN"]);
    expect(parseSupportedCountries("")).toEqual([]);
    expect(parseSupportedCountries("  ")).toEqual([]);
  });

  it("parses and serializes expertise chips with comma spacing", () => {
    expect(parseExpertiseChips("shreyans is good, food is good")).toEqual([
      "shreyans is good",
      "food is good",
    ]);
    expect(
      serializeExpertiseChips(["shreyans is good", "food is good"]),
    ).toBe("shreyans is good, food is good");
  });

  it("normalizes years input to '<n> years' for the API", () => {
    expect(normalizeYearsOfXp("12")).toBe("12 years");
    expect(normalizeYearsOfXp("12 years")).toBe("12 years");
    expect(normalizeYearsOfXp("12 year")).toBe("12 years");
    expect(normalizeYearsOfXp("")).toBe("");
    expect(yearsOfXpInputValue("12 years")).toBe("12");
  });

  it("omits empty optional profile strings", () => {
    expect(optionalProfileString("")).toBeUndefined();
    expect(optionalProfileString("  ")).toBeUndefined();
    expect(optionalProfileString(null)).toBeUndefined();
    expect(optionalProfileString(" Ancient coins ")).toBe("Ancient coins");
  });

  it("builds create body without isInternal and without empty optionals", () => {
    const body = buildCreateExpertBody({
      ...baseForm,
      profilePicture: "",
      oneLineDescription: "  ",
    });
    expect(body).toEqual({
      name: "Expert One",
      email: "expert@example.com",
      password: "secret",
      supportedCountries: ["IN", "GB"],
      yearsOfXp: "12 years",
      expertise: "Ancient coins, British India",
    });
    expect(body).not.toHaveProperty("isInternal");
    expect(body).not.toHaveProperty("profilePicture");
    expect(body).not.toHaveProperty("oneLineDescription");
  });

  it("builds update body and only includes password when set", () => {
    expect(
      buildUpdateExpertBody({ ...baseForm, password: "", confirmPassword: "" }),
    ).not.toHaveProperty("password");
    expect(
      buildUpdateExpertBody({ ...baseForm, password: "new-secret" }).password,
    ).toBe("new-secret");
  });

  it("always sends required years and expertise on update", () => {
    const body = buildUpdateExpertBody({
      ...baseForm,
      password: "",
      confirmPassword: "",
      profilePicture: "",
      oneLineDescription: "",
    });
    expect(body).toEqual({
      name: "Expert One",
      email: "expert@example.com",
      supportedCountries: ["IN", "GB"],
      yearsOfXp: "12 years",
      expertise: "Ancient coins, British India",
    });
  });

  it("validates required create fields including confirm password", () => {
    expect(
      validateExpertProfileForm(
        {
          ...baseForm,
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          yearsOfXp: "",
          expertise: "",
        },
        { requirePassword: true },
      ),
    ).toEqual({
      name: "Name is required",
      email: "Email is required",
      yearsOfXp: "Enter years of experience as a number (e.g. 12)",
      expertise: "Expertise is required",
      password: "Password is required",
      confirmPassword: "Confirm password is required",
    });
  });

  it("requires matching passwords when provided", () => {
    expect(
      validateExpertProfileForm(
        { ...baseForm, password: "a", confirmPassword: "b" },
        { requirePassword: true },
      ).confirmPassword,
    ).toBe("Passwords do not match");
  });

  it("clamps one-line description to 200 characters", () => {
    const long = "a".repeat(250);
    expect(clampOneLineDescription(long)).toHaveLength(200);
    expect(
      buildCreateExpertBody({
        ...baseForm,
        oneLineDescription: long,
      }).oneLineDescription,
    ).toHaveLength(200);
  });

  it("blocks deactivation of internal experts", () => {
    expect(canSetExpertStatus(true, "suspended")).toBe(false);
    expect(canSetExpertStatus(true, "blocked")).toBe(false);
    expect(canSetExpertStatus(true, "active")).toBe(true);
    expect(canSetExpertStatus(false, "suspended")).toBe(true);
  });
});
