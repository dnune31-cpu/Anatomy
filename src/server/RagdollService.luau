--!strict
-- Server-authoritative ragdoll + fling for R15 and R6 characters.
--
-- While ragdolled the server owns the body's physics, so every client sees
-- the same tumble and the owning client can't snap the body back upright.
--
-- API:
--   RagdollService.Ragdoll(character, duration?)  -- duration = math.huge to stay down
--   RagdollService.Unragdoll(character)
--   RagdollService.Fling(character, velocity, duration?)
--   RagdollService.IsRagdolled(character) -> boolean

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage.Shared.RagdollConfig)

type RagdollState = {
	token: number,
	motors: { Motor6D },
	created: { Instance },
	collisions: { [BasePart]: boolean },
	requiresNeck: boolean,
}

local RagdollService = {}

local states: { [Model]: RagdollState } = {}
local random = Random.new()

local function getHumanoid(character: Model): Humanoid?
	return character:FindFirstChildOfClass("Humanoid")
end

local function setServerOwnership(character: Model)
	for _, part in character:GetDescendants() do
		if part:IsA("BasePart") and not part.Anchored and part:CanSetNetworkOwnership() then
			part:SetNetworkOwner(nil)
		end
	end
end

local function restoreOwnership(character: Model)
	local player = Players:GetPlayerFromCharacter(character)
	local root = character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if root and not root.Anchored and root:CanSetNetworkOwnership() then
		if player then
			root:SetNetworkOwner(player)
		else
			root:SetNetworkOwnershipAuto()
		end
	end
end

local function makeSocket(motor: Motor6D, state: RagdollState)
	local part0 = motor.Part0
	local part1 = motor.Part1
	if not part0 or not part1 then
		return
	end

	local a0 = Instance.new("Attachment")
	a0.Name = "RagdollAttachment0"
	a0.CFrame = motor.C0
	a0.Parent = part0

	local a1 = Instance.new("Attachment")
	a1.Name = "RagdollAttachment1"
	a1.CFrame = motor.C1
	a1.Parent = part1

	local limits = Config.LooseJoints[motor.Name]
	local socket = Instance.new("BallSocketConstraint")
	socket.Name = "RagdollSocket"
	socket.Attachment0 = a0
	socket.Attachment1 = a1
	socket.LimitsEnabled = true
	socket.TwistLimitsEnabled = true
	socket.UpperAngle = if limits then limits.UpperAngle else Config.UpperAngle
	socket.TwistLowerAngle = if limits then limits.TwistLower else Config.TwistLowerAngle
	socket.TwistUpperAngle = if limits then limits.TwistUpper else Config.TwistUpperAngle
	socket.Parent = part0

	-- Adjacent limbs overlap at the joint; without this they fight and jitter.
	local noCollide = Instance.new("NoCollisionConstraint")
	noCollide.Name = "RagdollNoCollide"
	noCollide.Part0 = part0
	noCollide.Part1 = part1
	noCollide.Parent = part0

	table.insert(state.created, a0)
	table.insert(state.created, a1)
	table.insert(state.created, socket)
	table.insert(state.created, noCollide)
end

function RagdollService.IsRagdolled(character: Model): boolean
	return states[character] ~= nil
end

function RagdollService.Unragdoll(character: Model)
	local state = states[character]
	if not state then
		return
	end
	states[character] = nil

	for _, inst in state.created do
		inst:Destroy()
	end
	for _, motor in state.motors do
		if motor.Parent then
			motor.Enabled = true
		end
	end
	for part, canCollide in state.collisions do
		if part.Parent then
			part.CanCollide = canCollide
		end
	end

	local humanoid = getHumanoid(character)
	if humanoid and humanoid.Health > 0 then
		humanoid.RequiresNeck = state.requiresNeck
		humanoid.AutoRotate = true
		humanoid:SetStateEnabled(Enum.HumanoidStateType.GettingUp, true)
		humanoid:ChangeState(Enum.HumanoidStateType.GettingUp)
	end

	restoreOwnership(character)
	character:SetAttribute(Config.RagdollAttribute, nil)
end

function RagdollService.Ragdoll(character: Model, duration: number?)
	local humanoid = getHumanoid(character)
	local root = character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not humanoid or not root then
		return
	end

	local holdTime = duration or Config.DefaultRagdollTime
	local state = states[character]

	if not state then
		local newState: RagdollState = {
			token = 0,
			motors = {},
			created = {},
			collisions = {},
			requiresNeck = humanoid.RequiresNeck,
		}
		state = newState
		states[character] = newState

		-- Take ownership while the body is still one assembly, then again per
		-- limb once the motors are off and each limb is its own assembly.
		setServerOwnership(character)

		humanoid.RequiresNeck = false
		humanoid.AutoRotate = false
		humanoid:SetStateEnabled(Enum.HumanoidStateType.GettingUp, false)
		humanoid:ChangeState(Enum.HumanoidStateType.Physics)

		for _, motor in character:GetDescendants() do
			-- Leave the root joint rigid so HumanoidRootPart rides with the
			-- torso instead of dangling as an invisible extra limb.
			if motor:IsA("Motor6D") and motor.Part0 ~= root then
				makeSocket(motor, newState)
				motor.Enabled = false
				table.insert(newState.motors, motor)
			end
		end

		for _, part in character:GetChildren() do
			if part:IsA("BasePart") and part ~= root then
				newState.collisions[part] = part.CanCollide
				part.CanCollide = true
			end
		end

		setServerOwnership(character)
		character:SetAttribute(Config.RagdollAttribute, true)
	end

	-- Re-ragdolling an already ragdolled body just restarts the timer.
	state.token += 1
	local token = state.token
	if holdTime ~= math.huge then
		task.delay(holdTime, function()
			local current = states[character]
			if current and current.token == token and humanoid.Health > 0 then
				RagdollService.Unragdoll(character)
			end
		end)
	end
end

function RagdollService.Fling(character: Model, velocity: Vector3, duration: number?)
	RagdollService.Ragdoll(character, duration)

	local launch = velocity + Vector3.new(0, Config.FlingLift, 0)
	for _, part in character:GetDescendants() do
		if part:IsA("BasePart") and not part.Anchored then
			part.AssemblyLinearVelocity = launch
		end
	end

	local torso = (character:FindFirstChild("UpperTorso") or character:FindFirstChild("Torso")) :: BasePart?
	if torso then
		local axis = random:NextUnitVector()
		torso.AssemblyAngularVelocity = axis * Config.FlingSpin
	end
end

local function onCharacterAdded(character: Model)
	local humanoid = character:WaitForChild("Humanoid", 10) :: Humanoid?
	if not humanoid then
		return
	end

	if Config.RagdollOnDeath then
		humanoid.BreakJointsOnDeath = false
		humanoid.Died:Connect(function()
			RagdollService.Ragdoll(character, math.huge)
		end)
	end

	character.Destroying:Connect(function()
		states[character] = nil
	end)
end

local function onPlayerAdded(player: Player)
	player.CharacterAdded:Connect(onCharacterAdded)
	if player.Character then
		task.spawn(onCharacterAdded, player.Character)
	end
end

Players.PlayerAdded:Connect(onPlayerAdded)
for _, player in Players:GetPlayers() do
	task.spawn(onPlayerAdded, player)
end

-- Characters are removed without Destroying firing in some respawn paths.
Players.PlayerRemoving:Connect(function(player)
	if player.Character then
		states[player.Character] = nil
	end
end)

return RagdollService
