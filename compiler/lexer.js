export function tokenize(source) {
    return source
        .split(/\s+/)
        .filter(Boolean);
}
