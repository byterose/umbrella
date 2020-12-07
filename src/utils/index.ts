import Vue from "vue";
import Web3 from "web3";
import { Lock } from "@snapshot-labs/lock";
import { provider, TransactionReceipt } from "web3-core";
import { AbiItem } from "web3-utils";
import YAM from "./abi/yam.json";
import MetaPool from "./abi/UmbrellaMetaPool.json";
import { ethers } from "ethers";

// export async function connectWallet() { }

export function stateSave(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state));
}

export function stateLoad(key) {
  if (window.localStorage.getItem(key)) {
    return JSON.parse(window.localStorage.getItem(key) || "");
  } else {
    return null;
  }
}

export function stateDestroy() {
  window.localStorage.clear();
}

export const getERC20Contract = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract((YAM.abi as unknown) as AbiItem, address);
  return contract;
};

export const getBalance = async (provider: provider, tokenAddress: string, userAddress: string): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress);
  try {
    const balance: string = await tokenContract.methods.balanceOf(userAddress).call();
    return balance;
  } catch (e) {
    return "0";
  }
};

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitTransaction = async (provider: provider, txHash: string) => {
  const web3 = new Web3(provider);
  let txReceipt: TransactionReceipt | null = null;
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash);
    txReceipt = r;
    await sleep(2000);
  }
  return txReceipt.status;
};

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress);
    return tokenContract.methods
      .approve(spenderAddress, ethers.constants.MaxUint256)
      .send({ from: userAddress, gas: 80000 }, async (error: any, txHash: string) => {
        if (error) {
          console.log("ERC20 could not be approved", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Approval transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const getStaked = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.balanceOf(account).call());
};

export const checkConnection = async ({ commit, dispatch }) => {
  await sleep(500);
  if (!Vue.prototype.$web3) {
    await dispatch("connect");
  }
};

// ========== MetaPool stuff ========
export const getMetaPool = (provider: provider, address: string) => {
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract((MetaPool.abi as unknown) as AbiItem, address);
  return contract;
};

export const getCoveredConcepts = async (provider: provider, metaPoolAddr: string): Promise<string[]> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const concepts: string[] = await metaContract.methods.getConcepts().call();
    return concepts;
  } catch (e) {
    return [];
  }
};

export const getConceptIndex = async (provider: provider, metaPoolAddr: string, concept: string): Promise<number> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const concepts: number = await metaContract.methods.getConceptIndex(concept).call();
    return concepts;
  } catch (e) {
    return -1;
  }
};

export const getConceptEnterable = async (provider: provider, metaPoolAddr: string, conceptIndex: number): Promise<boolean> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const enterable: boolean = await metaContract.methods.conceptEnterable(conceptIndex).call();
    return enterable;
  } catch (e) {
    return false;
  }
};

interface Protection {
  coverageAmount: string;
  paid: string;
  holder: string;
  start: number;
  expiry: number;
  conceptIndex: number;
  status: number;
}

export const getProtectionInfo = async (provider: provider, metaPoolAddr: string, pid: number): Promise<Protection> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const info: Protection = await metaContract.methods.getProtectionInfo(pid).call();
    return info;
  } catch (e) {
    console.log("Couldn't get protection: ", pid);
    return {} as any;
  }
};

export const getProviderTPS = async (provider: provider, metaPoolAddr: string, pp: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const tps: string = await metaContract.methods.getCurrentProviderTPS(pp).call();
    return tps;
  } catch (e) {
    console.log("Couldn't get provider tps: ", pp);
    return {} as any;
  }
};

export const getGlobalTPS = async (provider: provider, metaPoolAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const tps: string = await metaContract.methods.currentTotalTPS().call();
    return tps;
  } catch (e) {
    console.log("Couldn't get global tps");
    return {} as any;
  }
};

export const buyProtection = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  conceptIndex: number,
  coverageAmount: string,
  duration: number,
  maxPay: string,
  deadline: number,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods
      .buyProtection(conceptIndex, coverageAmount, duration, maxPay, deadline)
      .send({ from: userAddress, gas: 280000 }, async (error: any, txHash: string) => {
        if (error) {
          console.log("MetaPool could not buy protection", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Buy protection transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const claim = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  pid: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.claim(pid).send({ from: userAddress, gas: 280000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not claim", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Claim transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const transferProtection = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  toAddress: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.transfer(toAddress).send({ from: userAddress, gas: 280000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not transfer protection", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Transfer transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const metaSetApprovalAl = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  operatorAddr: string,
  approved: boolean,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods
      .setApprovalForAll(operatorAddr, approved)
      .send({ from: userAddress, gas: 280000 }, async (error: any, txHash: string) => {
        if (error) {
          console.log("MetaPool could not transfer protection", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("setApprovalForAll transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const metaSafeTransferFrom = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  fromAddr: string,
  toAddr: string,
  pid: string,
  data: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods
      .safeTransferFrom(fromAddr, toAddr, pid, data)
      .send({ from: userAddress, gas: 280000 }, async (error: any, txHash: string) => {
        if (error) {
          console.log("MetaPool could not transfer protection", error);
          onTxHash && onTxHash("");
          return false;
        }
        if (onTxHash) {
          onTxHash(txHash);
        }
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("setApprovalForAll transaction failed.");
          return false;
        }
        return true;
      });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const provideCoverage = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  amount: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.provideCoverage(amount).send({ from: userAddress, gas: 480000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not provide coverage", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("provideCoverage transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const initiateWithdraw = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.initiateWithdraw().send({ from: userAddress, gas: 80000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not initiate withdraw", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Initiate withdraw transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const withdraw = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  amount: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.withdraw(amount).send({ from: userAddress, gas: 480000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not withdraw", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Withdraw transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const claimPremiums = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.claimPremiums().send({ from: userAddress, gas: 480000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not withdraw", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Withdraw transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const sweepPremiums = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  pids: string[],
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.sweepPremiums(pids).send({ from: userAddress, gas: 1480000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not sweep premiums", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Sweep multiple transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const sweep = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  pid: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.sweep(pid).send({ from: userAddress, gas: 380000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not sweep premium", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Sweep transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const getProviderBalance = async (provider: provider, metaPoolAddr: string, providerAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const bal: string = await metaContract.methods.balanceOf(providerAddr).call();
    return bal;
  } catch (e) {
    console.log("Couldn't get provider bal");
    return "0";
  }
};

interface ProtectionProvider {
  totalTokenSecondsProvided: string;
  premiumIndex: string;
  curTokens: string;
  lastUpdate: number;
  lastProvide: number;
  withdrawInitiated: number;
}

export const getProviderWithdrawTime = async (provider: provider, metaPoolAddr: string, providerAddr: string): Promise<number> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const provider: ProtectionProvider = await metaContract.methods.providers(providerAddr).call();
    return provider.withdrawInitiated;
  } catch (e) {
    console.log("Couldn't get getProviderWithdrawTime");
    return 0;
  }
};

export const canWithdraw = async (provider: provider, metaPoolAddr: string, providerAddr: string): Promise<boolean> => {
  const withdrawInitiatedTime: number = await getProviderWithdrawTime(provider, metaPoolAddr, providerAddr);
  const seconds = new Date().getTime() / 1000;
  if (seconds > withdrawInitiatedTime) {
    const delta = seconds - withdrawInitiatedTime;
    if (delta > 86400 * 7 && delta <= 86400 * 14) {
      return true;
    }
  }
  return false;
};

export const getPrice = async (provider: provider, metaPoolAddr: string, coverage: string, duration: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const price: string = await metaContract.methods.currentPrice(coverage, duration).call();
    return price;
  } catch (e) {
    console.log("Couldn't get price");
    return "0";
  }
};

export const getPayoutToken = async (provider: provider, metaPoolAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const tokenAddr: string = await metaContract.methods.payToken().call();
    return tokenAddr;
  } catch (e) {
    console.log("Couldn't get payToken");
    return "0";
  }
};

export const getClaimablePremiums = async (provider: provider, metaPoolAddr: string, providerAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const premiums: string = await metaContract.methods.claimablePremiums(providerAddr).call();
    return premiums;
  } catch (e) {
    console.log("Couldn't get provider claimable premiums");
    return "0";
  }
};

export const getReserves = async (provider: provider, metaPoolAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const reserves: string = await metaContract.methods.reserves().call();
    return reserves;
  } catch (e) {
    console.log("Couldn't get reserves");
    return "0";
  }
};

export const getUtilized = async (provider: provider, metaPoolAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const utilized: string = await metaContract.methods.utilized().call();
    return utilized;
  } catch (e) {
    console.log("Couldn't get utilized");
    return "0";
  }
};

export const getDescription = async (provider: provider, metaPoolAddr: string): Promise<string> => {
  const metaContract = getMetaPool(provider, metaPoolAddr);
  try {
    const description: string = await metaContract.methods.description().call();
    return description;
  } catch (e) {
    console.log("Couldn't get description");
    return "";
  }
};

// arbiter functions
export const enterCooldown = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  index: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.enterCooldown(index).send({ from: userAddress, gas: 380000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not enter cooldown", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Enter Cooldown transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const reactivateConcept = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  index: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods.reactivateConcept(index).send({ from: userAddress, gas: 380000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not reactivateConcept", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("reactivateConcept transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const setSettling = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  index: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods._setSettling(index).send({ from: userAddress, gas: 580000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not _setSettling", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Set settling transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

export const claimArbiterFees = async (
  provider: provider,
  metaPoolAddr: string,
  userAddress: string,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const metaContract = getMetaPool(provider, metaPoolAddr);
    return metaContract.methods._getArbiterFees().send({ from: userAddress, gas: 580000 }, async (error: any, txHash: string) => {
      if (error) {
        console.log("MetaPool could not _getArbiterFees", error);
        onTxHash && onTxHash("");
        return false;
      }
      if (onTxHash) {
        onTxHash(txHash);
      }
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("_getArbiterFees transaction failed.");
        return false;
      }
      return true;
    });
  } catch (e) {
    console.log("error", e);
    return false;
  }
};

// ========================
