# Dropdown Component

A reusable, user-friendly dropdown component with enhanced UX features.

## Features

- **Clean Design**: Modern, accessible dropdown with hover states and animations
- **Searchable**: Optional search functionality for large option lists
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Enter, Escape)
- **Click Outside**: Closes when clicking outside the dropdown
- **Loading States**: Support for disabled state
- **Validation**: Built-in error state styling
- **Customizable**: Flexible styling and behavior options

## Usage

### Basic Usage

```tsx
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';

const options: DropdownOption[] = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

const [selectedValue, setSelectedValue] = useState("");

<Dropdown
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Choose an option"
  label="Select Option"
  required
/>
```

### Searchable Dropdown

```tsx
<Dropdown
  options={countryOptions}
  value={country}
  onChange={setCountry}
  placeholder="Select Country"
  label="Country"
  searchable
  required
/>
```

### With Error State

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  label="Required Field"
  required
  error="This field is required"
/>
```

### Disabled Options

```tsx
const options: DropdownOption[] = [
  { value: "active", label: "Active Option" },
  { value: "disabled", label: "Disabled Option", disabled: true },
];
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | - | Array of dropdown options |
| `value` | `string` | - | Currently selected value |
| `onChange` | `(value: string) => void` | - | Callback when selection changes |
| `placeholder` | `string` | "Select an option" | Placeholder text |
| `label` | `string` | - | Optional label above dropdown |
| `required` | `boolean` | `false` | Shows required asterisk |
| `disabled` | `boolean` | `false` | Disables the dropdown |
| `error` | `string` | - | Error message to display |
| `className` | `string` | `""` | Additional CSS classes |
| `searchable` | `boolean` | `false` | Enables search functionality |

## DropdownOption Interface

```tsx
interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

## Styling

The component uses Tailwind CSS classes and can be customized by:

1. **CSS Classes**: Pass custom classes via `className` prop
2. **Tailwind Variants**: Modify the component's Tailwind classes
3. **CSS Custom Properties**: Override specific design tokens

## Accessibility

- Full keyboard navigation support
- ARIA attributes for screen readers
- Focus management
- Semantic HTML structure

## Examples in Project

Used in the Contracting Authorities form for:
- Country selection (with search)
- Authority type selection
- Any other dropdown needs throughout the application