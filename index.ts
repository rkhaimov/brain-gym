type LogCompose = <GIn, GOut, HOut>(
  g: (arg: GIn) => [GOut, string],
  h: (arg: GOut) => [HOut, string],
) => (arg: GIn) => [HOut, string];
