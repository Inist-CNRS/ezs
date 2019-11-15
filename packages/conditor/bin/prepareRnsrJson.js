#!/usr/bin/env node

const path = require('path');
const xmlParser = require('fast-xml-parser');
const { promises } = require('fs');
const { depleteString } = require('../lib/strings');

async function getRNSR() {
    const RNSRXML = await promises.readFile(`${__dirname}/../data/RNSR.xml`, {
        encoding: 'utf8',
    });
    const RNSR = xmlParser.parse(RNSRXML, {
        ignoreAttributes: true,
        ignoreNameSpace: true,
        trimValues: true,
    });
    return RNSR;
}

/**
 * @param {import('../lib/rnsr').EtabAssoc} etabAssoc
 * @returns {import('../lib/rnsr').EtabAssoc}
 */
const simplifyEtabAssoc = (etabAssoc) => {
    const simplifiedEtab = {
        sigle: etabAssoc.etab.sigle,
        libelle: etabAssoc.etab.libelle,
        sigleAppauvri: depleteString(etabAssoc.etab.sigle),
        libelleAppauvri: depleteString(etabAssoc.etab.libelle),
    };
    const simplifiedEtabAssoc = {
        etab: simplifiedEtab,
        label: etabAssoc.label,
        labelAppauvri: depleteString(etabAssoc.label),
        numero: etabAssoc.numero,
    };
    return simplifiedEtabAssoc;
};

/**
 * @param {import('../lib/rnsr').EtabAssoc} etabAssoc
 * @returns {boolean}
 */
const isTutelle = (etabAssoc) => etabAssoc.natTutEtab === 'TUTE';

/**
 * @param {import('../lib/rnsr').Structure} structure
 * @returns {import('../lib/rnsr').Structure}
 */
const simplifyStructure = (structure) => {
    if (!structure.etabAssoc) return structure;
    let simplifiedEtabAssoc;
    if (Array.isArray(structure.etabAssoc)) {
        simplifiedEtabAssoc = structure.etabAssoc
            .filter(isTutelle)
            .map(simplifyEtabAssoc);
    } else {
        simplifiedEtabAssoc = [simplifyEtabAssoc(structure.etabAssoc)];
    }
    const simplifiedStructure = {
        num_nat_struct: structure.num_nat_struct,
        intitule: structure.intitule,
        sigle: structure.sigle,
        ville_postale: structure.ville_postale,
        code_postal: structure.code_postal,
        etabAssoc: simplifiedEtabAssoc,
        intituleAppauvri: depleteString(structure.intitule),
        sigleAppauvri: depleteString(structure.sigle),
        ville_postale_appauvrie: depleteString(structure.ville_postale),
    };
    return simplifiedStructure;
};

getRNSR()
    .then((rnsr) => {
        const simplifiedStructures = rnsr.structures.structure.map(simplifyStructure);
        const simplifiedRnsr = { structures: { structure: simplifiedStructures } };
        return simplifiedRnsr;
    })
    .then((simplifiedRnsr) => promises
        .writeFile(path.join(__dirname, '../data/RNSR.json'), JSON.stringify(simplifiedRnsr), { encoding: 'utf8' }))
    .then(() => {
        // eslint-disable-next-line no-console
        console.log('data/RNSR.json updated');
    });
