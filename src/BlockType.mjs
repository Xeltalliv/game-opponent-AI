export const BlockType = {
	AIR: 0,
	HARD_WALL: 1,
	SOFT_WALL: 2,
	EXPLOSION_X: 3,
	EXPLOSION_Y: 4,
	EXPLOSION_CROSS: 5,
	EXIT: 6,
}

export const BlockProps = [
	{solid: false, explosion: false},
	{solid: true , explosion: false},
	{solid: true , explosion: false},
	{solid: false, explosion: true },
	{solid: false, explosion: true },
	{solid: false, explosion: true },
	{solid: false, explosion: false},
]

export const HiddenType = {
	EXIT: 1,
	POWERUP_BOMBS: 2,
	POWERUP_RANGE: 3,
	POWERUP_SPEED: 4,
	POWERUP_LIFE: 5,
}