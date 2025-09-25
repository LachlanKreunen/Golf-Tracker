import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function Start() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const fetchCourses = async (query) => {
    try {
      setSearchLoading(true);
      const res = await fetch(
        `https://api.golfcourseapi.com/v1/search?search_query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Key SFLYRBLKGKXXKS7TVE2BYBV4LI",
          },
          mode: "cors",
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      const { courses = [] } = await res.json();
      setCourses(courses);
      setLastError(null);
    } catch (err) {
      console.error("Course fetch error:", err);
      setCourses([]);
      setLastError("Search failed. Try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // fetch when >2 chars
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!showDropdown || searchTerm.length < 3) {
      setCourses([]);
      setFiltered([]);
      setHighlightedIndex(-1);
      return;
    }

    debounceRef.current = setTimeout(() => fetchCourses(searchTerm), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, showDropdown]);

  useEffect(() => {
    if (!showDropdown || !searchTerm) {
      setFiltered([]);
      setHighlightedIndex(-1);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const f = courses.filter((c) =>
      (c.course_name || "").toLowerCase().includes(lower)
    );
    setFiltered(f);
    setHighlightedIndex(f.length ? 0 : -1);
  }, [searchTerm, courses, showDropdown]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const gatherAllTeeBoxes = (courseObj) => {
    const tees = courseObj?.tees;
    if (Array.isArray(tees)) {
      return tees.map((t) => ({ ...t, _gender: t._gender ?? null }));
    }
    const male = Array.isArray(tees?.male) ? tees.male : [];
    const female = Array.isArray(tees?.female) ? tees.female : [];
    const other = Array.isArray(tees?.other) ? tees.other : [];
    return [
      ...male.map((t) => ({ ...t, _gender: "male" })),
      ...female.map((t) => ({ ...t, _gender: "female" })),
      ...other.map((t) => ({ ...t, _gender: "other" })),
    ];
  };

  const pickHighestTeeBox = (teeBoxes) => {
    let best = null;
    let bestYards = -1;
    teeBoxes.forEach((t) => {
      const total =
        (typeof t.total_yards === "number" ? t.total_yards : null) ??
        (Array.isArray(t.holes)
          ? t.holes.reduce((s, h) => s + (Number(h?.yardage) || 0), 0)
          : 0);
      if (total > bestYards) {
        bestYards = total;
        best = t;
      }
    });
    return best;
  };

  const buildHoleDataFromTee = (tee) => {
    const holes = Array.isArray(tee?.holes) ? tee.holes : [];
    return holes.map((h, i) => ({
      holeNumber:
        typeof h?.hole_number === "number" ? h.hole_number : i + 1,
      yards: Number(h?.yardage) || 0,
      par: typeof h?.par === "number" ? h.par : null,
      handicap: typeof h?.handicap === "number" ? h.handicap : null,
      teeName: tee?.tee_name ?? null,
    }));
  };

  const buildHoleDataFromCourse = (courseObj) => {
    const holes = Array.isArray(courseObj?.holes) ? courseObj.holes : [];
    return holes.map((h, i) => ({
      holeNumber:
        typeof h?.hole_number === "number" ? h.hole_number : i + 1,
      yards: Number(h?.yardage) || 0,
      par: typeof h?.par === "number" ? h.par : null,
      handicap: typeof h?.handicap === "number" ? h.handicap : null,
      teeName: "Default",
    }));
  };

  const handleSelect = (course) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSelectedCourse(course);
    setSearchTerm(course.course_name || "");
    setShowDropdown(false);
    setFiltered([]);
    setCourses([]);
    setHighlightedIndex(-1);
    setLastError(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i <= 0 ? filtered.length - 1 : i - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item =
        highlightedIndex >= 0 ? filtered[highlightedIndex] : null;
      if (item) handleSelect(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleStartClick = async () => {
    if (!selectedCourse || loading) return;
    setLoading(true);
    setLastError(null);

    try {
      const courseId =
        selectedCourse?.id ??
        selectedCourse?.course_id ??
        selectedCourse?.courseId;

      if (!courseId) throw new Error("Selected course has no id.");

      const res = await fetch(
        `https://api.golfcourseapi.com/v1/courses/${courseId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Key SFLYRBLKGKXXKS7TVE2BYBV4LI",
          },
          mode: "cors",
          cache: "no-store",
        }
      );

      const text = await res.text();
      if (!res.ok) {
        console.error("Course fetch failed:", res.status, res.statusText, text);
        throw new Error(`API ${res.status} ${res.statusText}`);
      }

      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }

      // unwrap
      const courseObj =
        payload?.course ??
        payload?.data?.course ??
        payload;

      // Tee sets first
      const allTeeBoxes = gatherAllTeeBoxes(courseObj);

      let holeData;
      let selectedTeeName;

      if (allTeeBoxes.length > 0) {
        let chosen = pickHighestTeeBox(allTeeBoxes);
        if (!chosen?.holes?.length) {
          chosen = allTeeBoxes.find(
            (t) => Array.isArray(t.holes) && t.holes.length > 0
          );
        }
        if (chosen?.holes?.length) {
          holeData = buildHoleDataFromTee(chosen);
          selectedTeeName = chosen.tee_name ?? null;
        }
      }

        //fallback
      if (!holeData || holeData.length === 0) {
        if (Array.isArray(courseObj?.holes) && courseObj.holes.length > 0) {
          holeData = buildHoleDataFromCourse(courseObj);
          selectedTeeName = "Default";
        } else {
          throw new Error("No tee sets or hole data available for this course.");
        }
      }

      navigate(`/holes/1`, {
        state: {
          holeData,
          selectedTeeName,
          // Pass a flat courseName so Hole.jsx can read it directly
          courseName: selectedCourse?.course_name ?? "",
          course: {
            id:
              selectedCourse?.id ??
              selectedCourse?.course_id ??
              selectedCourse?.courseId,
            name: selectedCourse?.course_name ?? "",
          },
        },
      });
    } catch (err) {
      console.error("Course fetch error:", err);
      setLastError(err?.message || "Unable to load course data.");
      alert("Unable to load course data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search courses…"
        value={searchTerm}
        onChange={(e) => {
          const v = e.target.value;
          setSearchTerm(v);
          setShowDropdown(v.length >= 3);
        }}
        onFocus={() => {
          if (searchTerm.length >= 3) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        className="search-input"
        aria-label="Search golf courses"
        aria-expanded={showDropdown}
        aria-controls="course-results"
        role="combobox"
      />

      {showDropdown && (
        <ul
          id="course-results"
          className="results-dropdown"
          role="listbox"
          aria-label="Course results"
        >
          {searchLoading && (
            <li role="option" aria-disabled="true">
              <div style={{ padding: "0.5rem 1rem", opacity: 0.7 }}>
                Searching…
              </div>
            </li>
          )}

          {!searchLoading && filtered.length === 0 && searchTerm.length >= 3 && (
            <li role="option" aria-disabled="true">
              <div style={{ padding: "0.5rem 1rem", opacity: 0.7 }}>
                No courses found
              </div>
            </li>
          )}

          {!searchLoading &&
            filtered.map((course, idx) => {
              const selected = course.id === selectedCourse?.id;
              const highlighted = idx === highlightedIndex;
              return (
                <li
                  key={course.id}
                  role="option"
                  aria-selected={selected || highlighted}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(course);
                    }}
                    className={
                      (selected ? "selected " : "") +
                      (highlighted ? " highlighted" : "")
                    }
                    style={
                      highlighted
                        ? { outline: "2px solid rgba(18,97,248,.5)" }
                        : undefined
                    }
                  >
                    {course.course_name}
                  </button>
                </li>
              );
            })}
        </ul>
      )}

      <div className="button-container" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          disabled={!selectedCourse || loading}
          onClick={handleStartClick}
          style={{
            opacity: selectedCourse && !loading ? 1 : 0.5,
            cursor: selectedCourse && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Loading…" : "Start"}
        </button>
      </div>

      {lastError && (
        <div style={{ marginTop: "0.5rem", color: "#b00020", fontSize: ".9rem" }}>
          {lastError}
        </div>
      )}
    </div>
  );
}
