import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"
import { parseUnits } from "ethers"

const DnaNFTModule = buildModule("DnaNFTModule", (m) => {
  const vrfCoordinator = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B"
  const subscriptionId = "6740279760095027207068218108686106497844924703346168202420468622852963149444"
  const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"
  const callbackGasLimit = 40000
  const requestConfirmations = 3
  const numWords = 1
  const mintPrice = parseUnits("0.0001", "ether")
  const maxSupply = 1000

  const dnaNFT = m.contract("DnaNFT", [
    vrfCoordinator,
    subscriptionId,
    keyHash,
    callbackGasLimit,
    requestConfirmations,
    numWords,
    mintPrice,
    maxSupply,
  ])

  return { dnaNFT }
})

export default DnaNFTModule
