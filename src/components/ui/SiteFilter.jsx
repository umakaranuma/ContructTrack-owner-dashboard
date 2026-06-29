import { useState, useEffect, useRef, useId } from 'react'
import { useSites, useSite } from '../../hooks/useSites'

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function normalizeSites(data) {
  if (!data) return []
  return Array.isArray(data) ? data : data.results ?? []
}

/**
 * Searchable site filter — fetches sites from GET /api/sites/?search=
 * Styled like input-field; filters server-side as the user types.
 */
export default function SiteFilter({
  value = '',
  onChange,
  className = '',
  label = 'Site',
  placeholder = 'Search sites…',
  showAllOption = true,
  allOptionLabel = 'All sites',
}) {
  const inputId = useId()
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isEditing, setIsEditing] = useState(false)

  const debouncedSearch = useDebounce(inputValue, 300)

  const { data: selectedSite } = useSite(value)
  const { data: sitesData, isLoading, isFetching } = useSites(
    { search: debouncedSearch, limit: 30 },
    { enabled: isOpen },
  )

  const sites = normalizeSites(sitesData)
  const options = showAllOption
    ? [{ id: '', name: allOptionLabel, location: null, isAll: true }, ...sites]
    : sites

  const displayValue = isEditing
    ? inputValue
    : (value && selectedSite?.name ? selectedSite.name : inputValue)

  // Sync when parent clears selection externally
  useEffect(() => {
    if (!value && !isEditing) setInputValue('')
  }, [value, isEditing])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsEditing(false)
        if (!value) setInputValue('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  function selectOption(option) {
    if (option.isAll || option.id === '') {
      onChange('')
      setInputValue('')
    } else {
      onChange(option.id)
      setInputValue(option.name)
    }
    setIsOpen(false)
    setIsEditing(false)
    setHighlightIndex(-1)
    inputRef.current?.blur()
  }

  function handleClear(e) {
    e.stopPropagation()
    onChange('')
    setInputValue('')
    setIsEditing(true)
    setIsOpen(true)
    setHighlightIndex(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(i => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      selectOption(options[highlightIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setIsEditing(false)
      if (!value) setInputValue('')
    }
  }

  const showClear = Boolean(value || inputValue)
  const busy = isLoading || isFetching

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${inputId}-listbox`}
          autoComplete="off"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setIsEditing(true)
            setIsOpen(true)
            setHighlightIndex(-1)
            if (value) onChange('')
          }}
          onFocus={() => {
            setIsOpen(true)
            setIsEditing(true)
            if (value && selectedSite?.name && !inputValue) {
              setInputValue(selectedSite.name)
            }
          }}
          onKeyDown={handleKeyDown}
          className="input-field w-full pl-9 pr-16"
        />

        {/* Clear + chevron */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-muted hover:text-off-white hover:bg-white/5 transition-colors"
              aria-label="Clear site filter"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(o => !o)
              if (!isOpen) inputRef.current?.focus()
            }}
            className="p-1 rounded text-muted hover:text-off-white transition-colors"
            aria-label="Toggle site list"
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
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-navy-light bg-navy-secondary shadow-xl py-1"
          >
            {busy && options.length <= (showAllOption ? 1 : 0) ? (
              <li className="px-4 py-3 text-sm text-muted">Searching sites…</li>
            ) : options.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">No sites match your search.</li>
            ) : (
              options.map((site, index) => {
                const isSelected = site.isAll ? !value : value === site.id
                const isHighlighted = index === highlightIndex
                return (
                  <li
                    key={site.id || 'all'}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectOption(site)}
                    className={`px-4 py-2.5 cursor-pointer transition-colors ${
                      isHighlighted || isSelected
                        ? 'bg-gold/10 text-off-white'
                        : 'text-off-white hover:bg-white/5'
                    }`}
                  >
                    <p className={`text-sm ${site.isAll ? 'text-muted' : 'font-medium'}`}>
                      {site.name}
                    </p>
                    {site.location && (
                      <p className="text-muted text-xs mt-0.5 truncate">{site.location}</p>
                    )}
                    {!site.isAll && site.address && !site.location && (
                      <p className="text-muted text-xs mt-0.5 truncate">{site.address}</p>
                    )}
                  </li>
                )
              })
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
