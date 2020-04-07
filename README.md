Personal blockchain for Conflux-chain development && client GUI for [conflux-valve](https://github.com/Conflux-Chain/conflux-valve) project, inspired by Ganache!

before run this project,you must be run the [conflux-docker](https://github.com/Conflux-Chain/conflux-docker) project.

following this step:

```shell
docker pull liqiazero/conflux-chain:v0.2.4


docker run --name conflux-chain  -p 12537:12537 -p 32323:32323 -p 32323:32323/udp -p 14629:14629 -p 12539:12539 -p 19629:19629 -d liqiazero/conflux-chain:v0.2.4
```
Requirements:

- `node v12.9.0`

To get started:

0. Clone this repo
0. Run `npm install`
0. Run `npm run start`
