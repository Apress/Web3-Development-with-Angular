const { ethers } = require("hardhat");

async function main() {
    const Factory = await ethers.getContractFactory("SimpleStorage");
    const contract = await Factory.deploy({ gasLimit: 3_000_000 }); // <— add this
    await contract.deployed();
    console.log("SimpleStorage deployed to:", contract.address);
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
