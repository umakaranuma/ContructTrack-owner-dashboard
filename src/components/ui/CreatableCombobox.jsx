import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { formatCustomLabel, normalizeCustomValue, optionLabel, saveCustomOption } from '../../constants/dailyLogOptions'

/**
 * Searchable dropdown that also accepts typed custom values.
 * Preset options + saved customs appear in the list; unmatched text offers "Use …".
 */
export default function CreatableCombobox({
  value,
  onChange,
  options = [],
  label,
  placeholder = 'Select or type…',
  storageKey,
  maxLength = 80,
  className = '',
}) {
  const inputId = useId()
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const displayLabel = optionLabel(value, options)

  useEffect(() => {
    if (!isEditing) setInputValue(displayLabel)
  }, [value, displayLabel, isEditing])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsEditing(false)
        setInputValue(displayLabel)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [displayLabel])

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    )
  }, [options, inputValue])

  const trimmed = inputValue.trim()
  const exactMatch = options.some(
    (o) => o.value === trimmed || o.label.toLowerCase() === trimmed.toLowerCase(),
  )
  const customCandidate = trimmed && !exactMatch
    ? normalizeCustomValue(trimmed, maxLength)
    : ''

  const listItems = useMemo(() => {
    const items = [...filtered]
    if (customCandidate && !items.some((o) => o.value === customCandidate)) {
      items.push({
        value: customCandidate,
        label: formatCustomLabel(customCandidate),
        isCustom: true,
      })
    }
    return items
  }, [filtered, customCandidate])

  function commit(option) {
    onChange(option.value)
    if (storageKey && option.isCustom) {
      saveCustomOption(storageKey, option.value, option.label)
    }
    setInputValue(option.label)
    setIsOpen(false)
    setIsEditing(false)
    setHighlightIndex(-1)
    inputRef.current?.blur()
  }

  function handleKeyDown(e) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, listItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && listItems[highlightIndex]) {
        commit(listItems[highlightIndex])
      } else if (customCandidate) {
        commit({ value: customCandidate, label: formatCustomLabel(customCandidate), isCustom: true })
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setIsEditing(false)
      setInputValue(displayLabel)
    }
  }

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={isEditing ? inputValue : displayLabel}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsEditing(true)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => {
            setIsOpen(true)
            setIsEditing(true)
            setInputValue(displayLabel)
          }}
          onKeyDown={handleKeyDown}
          className="input w-full pr-9"
        />

        <button
          type="button"
          onClick={() => {
            setIsOpen((o) => !o)
            if (!isOpen) inputRef.current?.focus()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-offwhite transition-colors"
          aria-label="Toggle options"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-40 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-navy-light bg-navy-secondary shadow-xl py-1"
          >
            {listItems.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">Type to add a custom value</li>
            ) : (
              listItems.map((option, index) => {
                const isHighlighted = index === highlightIndex
                const isSelected = value === option.value
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(option)}
                    className={`px-4 py-2.5 cursor-pointer transition-colors ${
                      isHighlighted || isSelected
                        ? 'bg-gold/10 text-offwhite'
                        : 'text-offwhite hover:bg-white/5'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {option.isCustom ? `Use "${option.label}"` : option.label}
                    </p>
                    {option.isCustom && (
                      <p className="text-muted text-xs mt-0.5">Custom value — saved for next time</p>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        )}
      </div>

      {value && !options.some((o) => o.value === value) && (
        <p className="text-muted text-xs mt-1">Custom: {formatCustomLabel(value)}</p>
      )}
    </div>
  )
}
