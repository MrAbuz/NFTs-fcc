# This repo will have 3 different contracts:

1. Basic NFT
2. Random IPFS hosted NFT (random at creation time)

    - Pros: Cheap
    - Cons: Someone needs to pin our data (atleast one person needs to have our data pinned)

    (thought) isnt it possible to programatically change the image/stats of an IPFS hosted data based of stats, price etc aswell?

3. Dynamic SVG NFT (hosted 100% on chain, and the image of it is gonna change based on some parameters)

    - Pros: The data is on chain!
    - Cons: MUCH more expensive! 

    Parameters: 
     - If price of ETH is above X -> Happy face
     - If price of ETH is below X -> Sad face

     (am I able to actually create the svg based on variables changing, or do we need to have all the possible svgs already built?)


 Important: We deployed all of our nft deploys first (from deploy 00 to 03) with the tag "main", excluding 04-mint which is the mint script, because we need to add the random ipfs contract as a consumer to https://vrf.chain.link/ first, before calling the mint script to mint one of those because it does the randomness at mint time
yarn hardhat deploy --network goerli --tags main -> then after adding random ipfs nft as a consumer -> yarn hardhat deploy --tags mint --network goerli

Also need to check where do to add the royalties.
For the dynamic svg, would be nice to probably add the eth price the user chooses when minting to the json as an attribute. would be easy because we already store it in a mapping and use that mapping in tokenuri, so it can be a variable in the attributes. and would be nice to be able to see that price when checking the nft attributes on opensea.

