export = (map1: (a: any) => any, map2: (a: any) => any): (a: any) => any => (v) => (map2(map1(v)))
