-- Crash sim triggers for the ragdoll fling:
--   * Vehicle crashes: a seated player whose vehicle loses speed abruptly is
--     ejected and flung with the vehicle's pre-impact velocity.
--   * Fling pads: parts tagged "FlingPad" launch whoever touches them.
--   * Studio-only test remote so you can fling yourself with a key press.

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Config = require(ReplicatedStorage.Shared.RagdollConfig)
local RagdollService = require(script.Parent.RagdollService)

-- Vehicle crashes ------------------------------------------------------------

local lastVelocity: { [Humanoid]: Vector3 } = {}

local function ejectAndFling(humanoid: Humanoid, seat: BasePart, velocity: Vector3)
	local character = humanoid.Parent :: Model

	-- Seats re-sit anyone who touches them, which would yank the body straight
	-- back in. Disable the seat briefly while the body clears the vehicle.
	local seatLike = seat :: any
	local wasDisabled = seatLike.Disabled
	seatLike.Disabled = true
	local weld = seat:FindFirstChild("SeatWeld")
	if weld then
		weld:Destroy()
	end
	humanoid.Sit = false

	RagdollService.Fling(character, velocity * Config.CrashVelocityCarry, Config.CrashRagdollTime)

	task.delay(1.5, function()
		if seat.Parent then
			seatLike.Disabled = wasDisabled
		end
	end)
end

RunService.Heartbeat:Connect(function()
	for _, player in Players:GetPlayers() do
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if not humanoid then
			continue
		end

		local seat = humanoid.SeatPart
		if not seat or humanoid.Health <= 0 or RagdollService.IsRagdolled(character) then
			lastVelocity[humanoid] = nil
			continue
		end

		local velocity = seat.AssemblyLinearVelocity
		local previous = lastVelocity[humanoid]
		lastVelocity[humanoid] = velocity

		if previous and previous.Magnitude >= Config.MinCrashSpeed then
			local drop = previous.Magnitude - velocity.Magnitude
			if drop >= Config.CrashSpeedDrop then
				lastVelocity[humanoid] = nil
				ejectAndFling(humanoid, seat, previous)
			end
		end
	end
end)

Players.PlayerRemoving:Connect(function(player)
	local humanoid = player.Character and player.Character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		lastVelocity[humanoid] = nil
	end
end)

-- Fling pads -----------------------------------------------------------------

local padCooldown: { [Model]: number } = {}

local function setupPad(pad: Instance)
	if not pad:IsA("BasePart") then
		return
	end
	pad.Touched:Connect(function(hit)
		local character = hit:FindFirstAncestorOfClass("Model")
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if not humanoid or humanoid.Health <= 0 then
			return
		end

		local now = os.clock()
		if (padCooldown[character] or 0) > now then
			return
		end
		padCooldown[character] = now + Config.PadCooldown

		local power = pad:GetAttribute("Power") or Config.DefaultPadPower
		local duration = pad:GetAttribute("RagdollTime") or Config.DefaultRagdollTime
		RagdollService.Fling(character, pad.CFrame.LookVector * power, duration)
	end)
end

CollectionService:GetInstanceAddedSignal(Config.FlingPadTag):Connect(setupPad)
for _, pad in CollectionService:GetTagged(Config.FlingPadTag) do
	setupPad(pad)
end

-- Studio test hook -----------------------------------------------------------

if RunService:IsStudio() then
	local remote = Instance.new("RemoteEvent")
	remote.Name = "RagdollTest"
	remote.Parent = ReplicatedStorage

	remote.OnServerEvent:Connect(function(player, action)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		if not root then
			return
		end
		if action == "fling" then
			RagdollService.Fling(character, root.CFrame.LookVector * 100)
		elseif action == "toggle" then
			if RagdollService.IsRagdolled(character) then
				RagdollService.Unragdoll(character)
			else
				RagdollService.Ragdoll(character, math.huge)
			end
		end
	end)
end
