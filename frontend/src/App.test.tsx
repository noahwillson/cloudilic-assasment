import { describe, it, expect } from "vitest";
import { render, screen as testingScreen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(testingScreen.getByTestId("react-flow")).toBeDefined();
  });
});
