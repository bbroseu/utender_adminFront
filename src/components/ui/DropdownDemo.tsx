import React, { useState } from 'react';
import { Dropdown, type DropdownOption } from './Dropdown';

const countryOptions: DropdownOption[] = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "in", label: "India" },
  { value: "cn", label: "China" },
  { value: "mx", label: "Mexico" },
  { value: "it", label: "Italy" },
  { value: "es", label: "Spain" },
  { value: "nl", label: "Netherlands" },
  { value: "se", label: "Sweden" },
];

const priorityOptions: DropdownOption[] = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent", disabled: false },
  { value: "blocked", label: "Blocked (Disabled)", disabled: true },
];

export const DropdownDemo: React.FC = () => {
  const [country, setCountry] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("tech");

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dropdown Component Demo</h1>
        <p className="text-gray-600">Showcasing the reusable Dropdown component with various configurations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Searchable Dropdown</h2>
          <Dropdown
            label="Country"
            options={countryOptions}
            value={country}
            onChange={setCountry}
            placeholder="Search and select country"
            searchable
            required
          />
          <p className="text-sm text-gray-500">Selected: {country || 'None'}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Standard Dropdown</h2>
          <Dropdown
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            placeholder="Select priority level"
          />
          <p className="text-sm text-gray-500">Selected: {priority || 'None'}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Pre-selected Value</h2>
          <Dropdown
            label="Category"
            options={[
              { value: "tech", label: "Technology" },
              { value: "design", label: "Design" },
              { value: "marketing", label: "Marketing" },
              { value: "sales", label: "Sales" },
            ]}
            value={category}
            onChange={setCategory}
            placeholder="Select category"
            required
          />
          <p className="text-sm text-gray-500">Selected: {category}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Disabled State</h2>
          <Dropdown
            label="Disabled Dropdown"
            options={priorityOptions}
            value="medium"
            onChange={() => {
              // Disabled dropdown - no action needed
            }}
            disabled
            placeholder="Cannot interact"
          />
          <p className="text-sm text-gray-500">This dropdown is disabled</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Demonstrated</h2>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Searchable functionality
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Required field indicators
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Disabled options
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Click outside to close
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Hover animations
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Keyboard navigation
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownDemo;