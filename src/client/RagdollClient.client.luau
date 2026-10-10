-- Client side of the ragdoll: follows the head with the camera while the body
-- tumbles, and binds Studio test keys (F = fling forward, G = toggle ragdoll).

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("RagdollConfig"))

local player = Players.LocalPlayer
local camera = workspace.CurrentCamera

local function onCharacter(character: Model)
	local humanoid = character:WaitForChild("Humanoid") :: Humanoid

	local function update()
		local ragdolled = character:GetAttribute(Config.RagdollAttribute) == true
		local head = character:FindFirstChild("Head")
		if ragdolled then
			-- The server owns the body now; stop local input from fighting it.
			humanoid:ChangeState(Enum.HumanoidStateType.Physics)
			if head then
				camera.CameraSubject = head
			end
		else
			camera.CameraSubject = humanoid
		end
	end

	character:GetAttributeChangedSignal(Config.RagdollAttribute):Connect(update)
	update()
end

player.CharacterAdded:Connect(onCharacter)
if player.Character then
	task.spawn(onCharacter, player.Character)
end

-- Studio test keys (the remote only exists when running in Studio).
local remote = ReplicatedStorage:WaitForChild("RagdollTest", 5)
if remote then
	UserInputService.InputBegan:Connect(function(input, processed)
		if processed then
			return
		end
		if input.KeyCode == Enum.KeyCode.F then
			remote:FireServer("fling")
		elseif input.KeyCode == Enum.KeyCode.G then
			remote:FireServer("toggle")
		end
	end)
end
