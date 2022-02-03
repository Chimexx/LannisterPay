const router = require("express").Router();
("use strict");
const fs = require("fs");

//Fees
router.post("/", (req, res) => {
	let config = [];
	let tempConfig = req.body.FeeConfigurationSpec.split("\n");
	let regExp = /\(([^)]+)\)/;

	for (let i = 0; i < tempConfig.length; i++) {
		config.push({
			id: tempConfig[i].split(" ")[0].trim(),
			currency: tempConfig[i].split(" ")[1].trim(),
			locale: tempConfig[i].split(" ")[2].trim(),
			feeEntity: tempConfig[i].split(" ")[3].split("(")[0].trim(),
			entityProperty: regExp.exec(tempConfig[i].split(" ")[3])[1].trim(),
			feeType: tempConfig[i].split(" ")[6].trim(),
			feeValue:
				tempConfig[i].split(" ")[6].trim() === "FLAT"
					? { flat: parseFloat(tempConfig[i].split(" ")[7].trim()) }
					: tempConfig[i].split(" ")[6].trim() === "FLAT_PERC"
					? {
							flat: parseFloat(tempConfig[i].split(" ")[7].split(":")[0].trim()),
							perc: parseFloat(tempConfig[i].split(" ")[7].split(":")[1].trim()),
					  }
					: { perc: parseFloat(tempConfig[i].split(" ")[7].trim()) },
		});
	}

	try {
		let data = JSON.stringify(config, null, 2);
		fs.writeFileSync("FeeConfigurationSpec.json", data);

		res.status(200).json({ status: "ok" });
	} catch (error) {
		res.status(500).json(error);
	}
});

module.exports = router;
