class SmartContract {
  constructor(idl, providerCall) {
    this.idl = idl;
    for (const def of idl.instructions) {
      this[def.handle] = (...argz) => {
        return providerCall(this.idl.id, def.handle, argz);
      }
    }
  }
}


export default class Web3 {
  constructor(providerUrl) {
    this.address = null;
    this.provider = new URL(providerUrl);
  }

  setClientAddress(clientAddr) {
    this.address = clientAddr;
  }

  call(rpcCall) {
    const postData = {
      ...rpcCall,
      address: this.address
    }

    return this.providerPostCall('call-smart-contract', postData)
  }

  initSmartContract(idl) {
    const providerCall = (id, method, args) =>
      this.call({ id, method, args });

    return new SmartContract(idl, providerCall);
  }

  getBalance(address) {
    const postData = { address: address ?? this.address };
    return this.providerPostCall('get-balance', postData);
  }


  transfer({ from, to, amount }) {
    const postData = {
      from: from ?? this.address,
      to,
      amount
    };
    return this.providerPostCall('transfer', postData);
  }

  async providerPostCall(path, body) {
    console.log('Provider called with ', body);

    const res = await fetch(`${this.provider.href}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // console.log(res.body);
    const response = await res.json();
    // console.log(response);
    if (response.error) {
      throw new Error(response.error);
    }

    return response.result;
  }
}