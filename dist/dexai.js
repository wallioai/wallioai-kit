"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexAi = void 0;
class DexAi {
    constructor(config) {
        this.walletProvider = config.walletProvider;
        this.adapters = config.adapters;
    }
}
exports.DexAi = DexAi;
