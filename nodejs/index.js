const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const { bech32, bech32m } = require('bech32');
const bip32 = BIP32Factory(ecc);
const bitcoin = require('bitcoinjs-lib');
const network = bitcoin.networks.bitcoin;

const addressToFind = ``;

function compareAddress(phrase, addressToCheck) {
  addressToCheck = addressToCheck;
  const seed = bip39.mnemonicToSeedSync(phrase);
  let root = bip32.fromSeed(seed, network);
  const path = "m/84'/0'/0'/0/0"; // Derivation path for BIP84 (segwit)
  const child = root.derivePath(path);
  const publicKey = child.publicKey;

  const { address } = bitcoin.payments.p2wpkh({ pubkey: publicKey });
  if (address == addressToCheck) {
    console.log('Found it!', phrase);
    return true;
  }
  return false;
}

// Seed phrase words
const firstWord = '';
const remainingWords = [];

let permutations = [];
let count = 0;

async function main() {
  const wordsWithoutFirst = remainingWords.filter((word) => word !== firstWord);
  permutations = permute(wordsWithoutFirst);
  console.log(`Generated ${permutations.length} permutations.`);

  const totalWorkers = require('os').cpus().length - 2;

  console.log(`Running with ${totalWorkers} worker(s).`);

  for (let i = 0; i < totalWorkers; i++) {
    const worker = new Worker(__filename, { workerData: i });

    worker.on('message', async (result) => {
      if (result == 'send') {
        let toIncrement = 100000;
        if (count < permutations.length) {
          if (count + 100000 > permutations.length) {
            toIncrement = permutations.length - count;
          }
          await worker.postMessage(permutations.slice(count, count + toIncrement));
          count += toIncrement;
          console.log(`Processed ${count} permutations.`);
        } else {
          console.log('finish permutations');
        }
      } else if (result == 'done') {
        process.exit(0);
      }
    });

    worker.on('error', (error) => {
      console.error('Worker error:', error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }
}

async function checkIfValid(seed) {
  if (!bip39.validateMnemonic(seed)) return false;
  if (!compareAddress(seed, addressToFind)) return false;

  console.log('Found it!', seed);
  return true;
}
function permute(arr) {
  const result = [];

  const permuteHelper = (arr, current) => {
    if (arr.length === 0) {
      result.push(current.slice());
    } else {
      for (let i = 0; i < arr.length; i++) {
        const remaining = arr.filter((_, index) => index !== i);
        permuteHelper(remaining, current.concat(arr[i]));
      }
    }
  };

  permuteHelper(arr, []);
  return result;
}

if (isMainThread) {
  main();
} else {
  console.log(`Worker ${workerData} Ready!`);
  parentPort.postMessage('send');
  parentPort.on('message', async (permutations) => {
    for (let i = 0; i < permutations.length; i++) {
      const testPhrase = `${firstWord} ${permutations[i].join(' ')}`;
      if ((await checkIfValid(testPhrase)) == true) {
        console.log(`Permunation number ${i + 1} is the correct one!`);
        parentPort.postMessage('done');
        process.exit(0);
      }
    }
    await parentPort.postMessage('send');
  });
}
