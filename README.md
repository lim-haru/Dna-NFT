# StartToImpact: Ethereum Advanced

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.13-yellow)](https://hardhat.org)
[![ChainlinkVRF](https://img.shields.io/badge/ChainlinkVRF-2.5-0847f7)](https://docs.chain.link/vrf/)
[![Ethereum](https://img.shields.io/badge/Powered%20by-Ethereum-blue)](https://ethereum.org/)

## Descrizione

`DnaNFT.sol` è uno smart contract scritto in Solidity che consente di creare NFT unici e autentici associati ad articoli digitali o video. Ogni NFT è contrassegnato da un ID unico generato casualmente tramite Chainlink VRF, garantendo così l'assenza di duplicati e la casualità nella generazione degli NFT. Permettendo agli utenti di ottenere informazioni sull’autenticità e la firma digitale dell'autore.

### [Presentazione](https://www.canva.com/design/DAGVyqGL2DY/n6o930047KH5yj-0jfRLFw/view?utm_content=DAGVyqGL2DY&utm_campaign=designshare&utm_medium=link&utm_source=editor)

## Funzionalità

- **Creazione di articoli**: Il proprietario del contratto può creare nuovi articoli, ciascuno con un URI univoco (TokenURI) che contiene informazioni sull'autenticità e sulla firma digitale dell'autore.
- **Minting di NFT per articoli**: Gli utenti possono creare un NFT per ciascun articolo già pubblicato, ottenendo un ID generato casualmente per l'NFT grazie a Chainlink VRF.
- **Controllo dell'ID NFT**: Gli utenti possono verificare il possesso di un NFT per uno specifico articolo e recuperare il suo TokenURI.
- **Scambio di NFT**: Gli utenti possono trasferire gli NFT tra account, consentendo lo scambio degli articoli digitali.
- **Prelievo dei fondi**: Il proprietario del contratto può prelevare i fondi accumulati nel contratto.

## Installazione

1. Clona il repository sul tuo computer:

```bash
git clone https://github.com/lim-haru/Dna-NFT.git
```

2. Entra nella directory del progetto:

```bash
cd Dna-NFT
```

3. Installa le dipendenze:

```bash
npm install
```

4. Configura le variabili d'ambiente nel tuo sistema o crea un file .env nella root del progetto con le seguenti variabili:

```
INFURA_KEY=key_progetto_infura
PRIVATE_KEY=chiave_privata_wallet
```

5. Compila i contratti tramite hardhat:

```bash
npx hardhat compile
```

### Test

Per eseguire i test:

```bash
npx hardhat test test/DnaNFT.ts
```

### Deploy Sepolia

Nel file ignition/modules/DnaNFT.ts sostituire il valore di `subscriptionId` con l'ID della tua sottoscrizione Chainlink VRF.

```TypeScript
const subscriptionId = "..."
```

Eseguire il deploy dei contratti sulla testnet Sepolia:

```bash
npx hardhat ignition deploy ignition/modules/DnaNFT.ts --network sepolia
```

## Indirizzo del Contratto

[Sepolia DnaNFT](https://sepolia.etherscan.io/address/0x774650D7d4567879593B2c1F57B1D84da4ccD932) : 0x774650D7d4567879593B2c1F57B1D84da4ccD932

## Tecnologie utilizzate

- **Solidity**: Linguaggio di programmazione per smart contract su Ethereum.
- **Hardhat**: Strumento di sviluppo per Ethereum per compilazione, testing e distribuzione degli smart contract.
- **OpenZeppelin**: Una libreria di contratti standardizzati e sicuri, utilizzata per estendere la funzionalità ERC721 con ERC721URIStorage.
- **TypeScript**: Utilizzato per migliorare la robustezza del codice e l'integrazione con Hardhat.
- **ChainlinkVRF**: Fornisce numeri casuali verificabili utilizzati per generare in modo casuale l'ID degli NFT, migliorando la sicurezza e garantendo che gli ID siano unici e casuali.

## Licenza 📄

Questo progetto è sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per maggiori dettagli.
