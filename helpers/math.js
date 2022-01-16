export function calculateDistance(t, mouseX, mouseY) {
    return Math.floor(Math.sqrt(Math.pow(mouseX - (t.last_x+t.radius), 2) + Math.pow(mouseY - (t.last_y+t.radius), 2)));
}
