-- Tuning values for the ragdoll + fling system. Shared so the client can read
-- the attribute name and camera settings.

return {
	-- Attribute set on the character model while it is ragdolled.
	RagdollAttribute = "Ragdolled",

	-- Seconds a living character stays ragdolled before getting back up.
	DefaultRagdollTime = 3,

	-- Ragdoll the character when it dies (instead of breaking apart).
	RagdollOnDeath = true,

	-- Joint limits (degrees) applied to every BallSocketConstraint.
	UpperAngle = 45,
	TwistLowerAngle = -45,
	TwistUpperAngle = 45,
	-- Wider limits for the neck and shoulders so they flop believably.
	LooseJoints = {
		Neck = { UpperAngle = 60, TwistLower = -70, TwistUpper = 70 },
		LeftShoulder = { UpperAngle = 90, TwistLower = -90, TwistUpper = 90 },
		RightShoulder = { UpperAngle = 90, TwistLower = -90, TwistUpper = 90 },
		["Left Shoulder"] = { UpperAngle = 90, TwistLower = -90, TwistUpper = 90 },
		["Right Shoulder"] = { UpperAngle = 90, TwistLower = -90, TwistUpper = 90 },
	},

	-- Fling
	-- Random spin (rad/s) added to the torso so bodies tumble.
	FlingSpin = 12,
	-- Extra upward velocity (studs/s) added to every fling.
	FlingLift = 25,

	-- Crash detection (vehicles)
	-- Ignore impacts when the vehicle was slower than this (studs/s).
	MinCrashSpeed = 40,
	-- Speed lost in a single physics step that counts as a crash (studs/s).
	CrashSpeedDrop = 35,
	-- Fraction of pre-crash velocity carried into the ejected body.
	CrashVelocityCarry = 1.1,
	-- Ragdoll time after a crash.
	CrashRagdollTime = 4,

	-- Fling pads
	-- Parts tagged with this CollectionService tag fling whoever touches them.
	-- Optional attributes on the pad: Power (number), RagdollTime (number).
	FlingPadTag = "FlingPad",
	DefaultPadPower = 120,
	PadCooldown = 1,
}
