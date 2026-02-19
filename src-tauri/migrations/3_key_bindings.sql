CREATE TABLE IF NOT EXISTS key_bindings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    key_code TEXT NOT NULL,
    label TEXT DEFAULT '',
    is_default BOOLEAN DEFAULT 1,
    UNIQUE(action, key_code)
);

-- Seed default bindings
INSERT INTO key_bindings (action, key_code, label, is_default) VALUES
    ('nav_up',    'ArrowUp',    'Arrow Up',    1),
    ('nav_down',  'ArrowDown',  'Arrow Down',  1),
    ('nav_left',  'ArrowLeft',  'Arrow Left',  1),
    ('nav_right', 'ArrowRight', 'Arrow Right', 1),
    ('confirm',   'Enter',      'Enter',       1),
    ('confirm',   'Space',      'Space',       1),
    ('back',      'Escape',     'Escape',      1),
    ('back',      'Backspace',  'Backspace',   1),
    ('add_point_left',  'KeyA',   'A', 1),
    ('add_point_right', 'KeyL',   'L', 1),
    ('undo',            'KeyZ',   'Z', 1),
    ('add_point_left',  'Digit1', '1', 1),
    ('add_point_right', 'Digit0', '0', 1);
