import React from 'react';

export default function Toggle({ value, onChange, labels = ['No', 'Yes'] }) {
  return (
    <div className="toggle-group">
      <button
        type="button"
        className={value ? 'active' : ''}
        onClick={() => onChange(true)}
        aria-pressed={value}
      >
        {labels[1]}
      </button>
      <button
        type="button"
        className={!value ? 'active' : ''}
        onClick={() => onChange(false)}
        aria-pressed={!value}
      >
        {labels[0]}
      </button>
    </div>
  );
}