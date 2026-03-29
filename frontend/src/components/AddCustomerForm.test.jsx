import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import AddCustomerForm from "./AddCustomerForm";


vi.mock("../api/customersApi", () => ({
  createCustomer: vi.fn(),
}));

vi.mock("../api/apiError", () => ({
  getApiErrorMessage: vi.fn(() => "Something went wrong"),
}));

describe("AddCustomerForm", () => {
  it("shows an error when submitted without a name", async () => {
    const user = userEvent.setup();
    const onCustomerCreated = vi.fn();

    render(<AddCustomerForm onCustomerCreated={onCustomerCreated} />);

    await user.click(
      screen.getByRole("button", { name: /add customer/i })
    );

    expect(
      screen.getByText("Customer name is required.")
    ).toBeInTheDocument();
  });
});

describe("AddCustomerForm", () => {
    it("shows an error when submitted without an email", async () => {
        const user = userEvent.setup();
        const onCustomerCreated = vi.fn();

        render(<AddCustomerForm onCustomerCreated={onCustomerCreated} />);

        const nameInput = screen.getByLabelText(/name/i);

        await user.type(nameInput, "Bozhidar");

        await user.click(
            screen.getByRole("button", {name: /add customer/i})
        );

        expect(
            screen.getByText("Customer email is required.")
        ).toBeInTheDocument();
    })
})

vi.mock("./countrySelect", () => ({
  default: ({ value, onChange }) => (
    <select
      aria-label="Country"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select country</option>
      <option value="Bulgaria">Bulgaria</option>
      <option value="Germany">Germany</option>
    </select>
  ),
}));

describe("AddCustomerForm", () => {
  it("shows an error when submitted without a country", async () => {
    const user = userEvent.setup();

    render(<AddCustomerForm onCustomerCreated={vi.fn()} />);

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)

    await user.type(nameInput, "Bozhidar");
    await user.type(emailInput, "bozhidar@abv.bg")

    await user.click(screen.getByRole("button", { name: /add customer/i }));

    expect(
      screen.getByText("Customer country is required.")
    ).toBeInTheDocument();
  });
});