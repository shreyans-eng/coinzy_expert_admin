import { describe, expect, it } from "vitest";
import {
  buildCreateExpertBody,
  buildUpdateExpertBody,
  canSetExpertStatus,
  optionalProfileString,
  parseSupportedCountries,
  validateExpertProfileForm,
} from "@/lib/expert-form";

const baseForm = {
  name: "Expert One",
  email: "expert@example.com",
  password: "secret",
  supportedCountries: "in, gb",
  profilePicture: "https://media.example.com/a.jpg",
  oneLineDescription: " Specialist ",
  yearsOfXp: "12 years",
  expertise: "Ancient coins",
};

describe("expert-form", () => {
  it("parses supported countries and treats blank as all countries", () => {
    expect(parseSupportedCountries("in, gb, in")).toEqual(["IN", "GB", "IN"]);
    expect(parseSupportedCountries("")).toEqual([]);
    expect(parseSupportedCountries("  ")).toEqual([]);
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
      expertise: "Ancient coins",
    });
    expect(body).not.toHaveProperty("isInternal");
    expect(body).not.toHaveProperty("profilePicture");
    expect(body).not.toHaveProperty("oneLineDescription");
  });

  it("builds update body and only includes password when set", () => {
    expect(
      buildUpdateExpertBody({ ...baseForm, password: "" }),
    ).not.toHaveProperty("password");
    expect(
      buildUpdateExpertBody({ ...baseForm, password: "new-secret" }).password,
    ).toBe("new-secret");
  });

  it("does not send null for cleared optional profile fields", () => {
    const body = buildUpdateExpertBody({
      ...baseForm,
      password: "",
      profilePicture: "",
      oneLineDescription: "",
      yearsOfXp: "",
      expertise: "",
    });
    expect(body).toEqual({
      name: "Expert One",
      email: "expert@example.com",
      supportedCountries: ["IN", "GB"],
    });
  });

  it("validates required create fields", () => {
    expect(
      validateExpertProfileForm(
        { ...baseForm, name: "", email: "", password: "" },
        { requirePassword: true },
      ),
    ).toEqual({
      name: "Name is required",
      email: "Email is required",
      password: "Password is required",
    });
  });

  it("blocks deactivation of internal experts", () => {
    expect(canSetExpertStatus(true, "suspended")).toBe(false);
    expect(canSetExpertStatus(true, "blocked")).toBe(false);
    expect(canSetExpertStatus(true, "active")).toBe(true);
    expect(canSetExpertStatus(false, "suspended")).toBe(true);
  });
});
