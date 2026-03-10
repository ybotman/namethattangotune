import { useState } from "react";

const GRID_DATA = {"decades":["1910s","1920s","1930s","1940s","1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s","Unknown"],"rows":[{"orchestra":"Anibal Troilo","level":"1","total":172,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":33,"vals":0,"milonga":2,"other":0,"total":35},"1950s":{"tango":64,"vals":0,"milonga":6,"other":0,"total":70},"1960s":{"tango":31,"vals":2,"milonga":1,"other":0,"total":34},"1970s":{"tango":3,"vals":0,"milonga":1,"other":0,"total":4},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":20,"vals":4,"milonga":5,"other":0,"total":29}}},{"orchestra":"Juan D'Arienzo","level":"1","total":158,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":13,"vals":3,"milonga":0,"other":0,"total":16},"1940s":{"tango":20,"vals":2,"milonga":3,"other":0,"total":25},"1950s":{"tango":16,"vals":1,"milonga":0,"other":0,"total":17},"1960s":{"tango":7,"vals":0,"milonga":1,"other":0,"total":8},"1970s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1980s":{"tango":2,"vals":0,"milonga":0,"other":0,"total":2},"1990s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2000s":{"tango":1,"vals":0,"milonga":4,"other":0,"total":5},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":70,"vals":11,"milonga":2,"other":0,"total":83}}},{"orchestra":"Carlos Di Sarli","level":"1","total":125,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":13,"vals":0,"milonga":0,"other":0,"total":13},"1930s":{"tango":12,"vals":0,"milonga":0,"other":0,"total":12},"1940s":{"tango":17,"vals":0,"milonga":0,"other":0,"total":17},"1950s":{"tango":23,"vals":3,"milonga":1,"other":0,"total":27},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":1,"vals":0,"milonga":5,"other":0,"total":6},"2000s":{"tango":2,"vals":0,"milonga":0,"other":0,"total":2},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":40,"vals":5,"milonga":3,"other":0,"total":48}}},{"orchestra":"Osvaldo Pugliese","level":"1","total":45,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":9,"vals":1,"milonga":1,"other":0,"total":11},"1950s":{"tango":6,"vals":0,"milonga":1,"other":0,"total":7},"1960s":{"tango":2,"vals":0,"milonga":0,"other":0,"total":2},"1970s":{"tango":0,"vals":1,"milonga":0,"other":0,"total":1},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":17,"vals":0,"milonga":0,"other":0,"total":17},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":6,"vals":1,"milonga":0,"other":0,"total":7}}},{"orchestra":"Osvaldo Fresedo","level":"2","total":312,"decades":{"1910s":{"tango":2,"vals":0,"milonga":0,"other":0,"total":2},"1920s":{"tango":91,"vals":0,"milonga":0,"other":0,"total":91},"1930s":{"tango":55,"vals":2,"milonga":0,"other":0,"total":57},"1940s":{"tango":61,"vals":2,"milonga":1,"other":0,"total":64},"1950s":{"tango":46,"vals":0,"milonga":4,"other":0,"total":50},"1960s":{"tango":16,"vals":0,"milonga":1,"other":0,"total":17},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":8,"vals":0,"milonga":0,"other":0,"total":8},"2000s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":22,"vals":0,"milonga":0,"other":0,"total":22}}},{"orchestra":"Francisco Canaro","level":"2","total":275,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":31,"vals":1,"milonga":0,"other":0,"total":32},"1930s":{"tango":92,"vals":12,"milonga":2,"other":4,"total":110},"1940s":{"tango":20,"vals":6,"milonga":1,"other":0,"total":27},"1950s":{"tango":4,"vals":0,"milonga":0,"other":0,"total":4},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":22,"vals":0,"milonga":1,"other":0,"total":23},"2000s":{"tango":2,"vals":0,"milonga":3,"other":0,"total":5},"2010s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":47,"vals":20,"milonga":6,"other":0,"total":73}}},{"orchestra":"Orquesta Típica Victor","level":"2","total":241,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":122,"vals":6,"milonga":0,"other":0,"total":128},"1930s":{"tango":88,"vals":14,"milonga":0,"other":0,"total":102},"1940s":{"tango":3,"vals":2,"milonga":0,"other":0,"total":5},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":6,"vals":0,"milonga":0,"other":0,"total":6}}},{"orchestra":"Francisco Lomuto","level":"2","total":147,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":6,"vals":0,"milonga":0,"other":0,"total":6},"1930s":{"tango":62,"vals":20,"milonga":0,"other":3,"total":85},"1940s":{"tango":27,"vals":14,"milonga":0,"other":1,"total":42},"1950s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":11,"vals":0,"milonga":1,"other":0,"total":12}}},{"orchestra":"Alfredo de Angelis","level":"2","total":110,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":7,"vals":1,"milonga":0,"other":0,"total":8},"1950s":{"tango":10,"vals":6,"milonga":4,"other":0,"total":20},"1960s":{"tango":11,"vals":3,"milonga":0,"other":0,"total":14},"1970s":{"tango":4,"vals":1,"milonga":0,"other":0,"total":5},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":7,"vals":0,"milonga":0,"other":0,"total":7},"2000s":{"tango":2,"vals":1,"milonga":0,"other":0,"total":3},"2010s":{"tango":10,"vals":0,"milonga":0,"other":0,"total":10},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":34,"vals":7,"milonga":2,"other":0,"total":43}}},{"orchestra":"Enrique Rodriguez","level":"2","total":107,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":4,"vals":6,"milonga":0,"other":2,"total":12},"1940s":{"tango":36,"vals":13,"milonga":2,"other":0,"total":51},"1950s":{"tango":10,"vals":3,"milonga":0,"other":0,"total":13},"1960s":{"tango":5,"vals":1,"milonga":1,"other":0,"total":7},"1970s":{"tango":0,"vals":0,"milonga":1,"other":0,"total":1},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":1,"milonga":0,"other":0,"total":1},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":18,"vals":2,"milonga":2,"other":0,"total":22}}},{"orchestra":"Rodolfo Biagi","level":"2","total":96,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1940s":{"tango":47,"vals":3,"milonga":1,"other":0,"total":51},"1950s":{"tango":4,"vals":1,"milonga":0,"other":0,"total":5},"1960s":{"tango":7,"vals":0,"milonga":0,"other":0,"total":7},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":1,"vals":1,"milonga":0,"other":0,"total":2},"2000s":{"tango":11,"vals":0,"milonga":0,"other":0,"total":11},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":12,"vals":5,"milonga":2,"other":0,"total":19}}},{"orchestra":"Miguel Calo","level":"2","total":78,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":27,"vals":4,"milonga":1,"other":0,"total":32},"1950s":{"tango":10,"vals":0,"milonga":0,"other":0,"total":10},"1960s":{"tango":10,"vals":0,"milonga":0,"other":0,"total":10},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":2,"vals":1,"milonga":0,"other":0,"total":3},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":16,"vals":5,"milonga":2,"other":0,"total":23}}},{"orchestra":"Edgardo Donato","level":"2","total":69,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":11,"vals":0,"milonga":0,"other":0,"total":11},"1940s":{"tango":3,"vals":0,"milonga":2,"other":0,"total":5},"1950s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":3,"vals":0,"milonga":1,"other":0,"total":4},"2000s":{"tango":14,"vals":1,"milonga":2,"other":0,"total":17},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":24,"vals":4,"milonga":3,"other":0,"total":31}}},{"orchestra":"Ricardo Tanturi","level":"2","total":69,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1940s":{"tango":21,"vals":4,"milonga":1,"other":0,"total":26},"1950s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":21,"vals":0,"milonga":0,"other":0,"total":21},"2000s":{"tango":0,"vals":0,"milonga":1,"other":0,"total":1},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":14,"vals":5,"milonga":0,"other":0,"total":19}}},{"orchestra":"Lucio Demare","level":"2","total":67,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":1,"vals":0,"milonga":1,"other":0,"total":2},"1940s":{"tango":36,"vals":1,"milonga":9,"other":0,"total":46},"1950s":{"tango":12,"vals":0,"milonga":0,"other":0,"total":12},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2000s":{"tango":6,"vals":0,"milonga":0,"other":0,"total":6},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Angel D'Agostino","level":"2","total":62,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":17,"vals":3,"milonga":1,"other":0,"total":21},"1950s":{"tango":8,"vals":0,"milonga":1,"other":0,"total":9},"1960s":{"tango":3,"vals":0,"milonga":0,"other":0,"total":3},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":1,"vals":0,"milonga":1,"other":0,"total":2},"2000s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":25,"vals":1,"milonga":0,"other":0,"total":26}}},{"orchestra":"Astor Piazzolla","level":"2","total":44,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":1,"milonga":0,"other":0,"total":1},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":13,"vals":0,"milonga":0,"other":0,"total":13},"1990s":{"tango":9,"vals":0,"milonga":0,"other":0,"total":9},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":21,"vals":0,"milonga":0,"other":0,"total":21}}},{"orchestra":"Héctor Varela","level":"2","total":36,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":24,"vals":1,"milonga":2,"other":0,"total":27},"1960s":{"tango":3,"vals":0,"milonga":1,"other":0,"total":4},"1970s":{"tango":4,"vals":1,"milonga":0,"other":0,"total":5},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Pedro Laurenz","level":"2","total":33,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1930s":{"tango":3,"vals":0,"milonga":0,"other":0,"total":3},"1940s":{"tango":8,"vals":0,"milonga":1,"other":0,"total":9},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":3,"vals":1,"milonga":0,"other":0,"total":4},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":2,"vals":2,"milonga":0,"other":0,"total":4},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":9,"vals":2,"milonga":1,"other":0,"total":12}}},{"orchestra":"Alberto Castillo","level":"3","total":135,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":54,"vals":11,"milonga":4,"other":0,"total":69},"1950s":{"tango":15,"vals":6,"milonga":3,"other":0,"total":24},"1960s":{"tango":3,"vals":1,"milonga":0,"other":0,"total":4},"1970s":{"tango":3,"vals":1,"milonga":1,"other":0,"total":5},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":18,"vals":0,"milonga":4,"other":0,"total":22},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":10,"vals":0,"milonga":1,"other":0,"total":11}}},{"orchestra":"Roberto Firpo","level":"3","total":101,"decades":{"1910s":{"tango":6,"vals":0,"milonga":0,"other":0,"total":6},"1920s":{"tango":7,"vals":0,"milonga":1,"other":0,"total":8},"1930s":{"tango":26,"vals":10,"milonga":0,"other":0,"total":36},"1940s":{"tango":7,"vals":1,"milonga":3,"other":0,"total":11},"1950s":{"tango":5,"vals":3,"milonga":3,"other":0,"total":11},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":29,"vals":0,"milonga":0,"other":0,"total":29},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Alfredo Gobbi","level":"3","total":46,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":5,"vals":3,"milonga":0,"other":0,"total":8},"1950s":{"tango":30,"vals":5,"milonga":2,"other":0,"total":37},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Florindo Sassone","level":"3","total":22,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":22,"vals":0,"milonga":0,"other":0,"total":22},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Juan Maglio","level":"5","total":255,"decades":{"1910s":{"tango":13,"vals":0,"milonga":0,"other":0,"total":13},"1920s":{"tango":180,"vals":6,"milonga":0,"other":0,"total":186},"1930s":{"tango":45,"vals":11,"milonga":0,"other":0,"total":56},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}},{"orchestra":"Julio De Caro","level":"5","total":88,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":18,"vals":0,"milonga":0,"other":0,"total":18},"1930s":{"tango":37,"vals":0,"milonga":1,"other":0,"total":38},"1940s":{"tango":9,"vals":2,"milonga":0,"other":0,"total":11},"1950s":{"tango":14,"vals":0,"milonga":0,"other":0,"total":14},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":4,"vals":0,"milonga":0,"other":0,"total":4},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":3,"vals":0,"milonga":0,"other":0,"total":3}}},{"orchestra":"Mario Melfi","level":"5","total":38,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":1,"vals":0,"milonga":0,"other":0,"total":1},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2000s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":37,"vals":0,"milonga":0,"other":0,"total":37}}},{"orchestra":"Caceres","level":"5","total":22,"decades":{"1910s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1920s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1930s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1940s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1950s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1960s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1970s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1980s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"1990s":{"tango":9,"vals":0,"milonga":0,"other":0,"total":9},"2000s":{"tango":13,"vals":0,"milonga":0,"other":0,"total":13},"2010s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"2020s":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0},"Unknown":{"tango":0,"vals":0,"milonga":0,"other":0,"total":0}}}]};

const LEVEL_COLORS = {
  "1": { bg: "#1a0a2e", accent: "#c084fc", label: "L1 · Icons" },
  "2": { bg: "#0c1a0f", accent: "#4ade80", label: "L2 · Core" },
  "3": { bg: "#0a1a1a", accent: "#38bdf8", label: "L3 · Standard" },
  "4": { bg: "#1a110a", accent: "#fb923c", label: "L4 · Deep" },
  "5": { bg: "#1a0a0a", accent: "#f87171", label: "L5 · Old Guard" },
};

const ACTIVE_DECADES = ["1910s","1920s","1930s","1940s","1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s","Unknown"];

function StyleBar({ t, v, m, total }) {
  if (!total) return null;
  const tp = Math.round((t / total) * 100);
  const vp = Math.round((v / total) * 100);
  const mp = Math.round((m / total) * 100);
  return (
    <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
      {tp > 0 && <div style={{ width: `${tp}%`, background: "#60a5fa" }} />}
      {vp > 0 && <div style={{ width: `${vp}%`, background: "#a78bfa" }} />}
      {mp > 0 && <div style={{ width: `${mp}%`, background: "#f97316" }} />}
    </div>
  );
}

function Cell({ data, maxVal, accentColor, onClick }) {
  if (!data || !data.total) {
    return <div style={{ width: 52, height: 44, background: "rgba(255,255,255,0.02)", borderRadius: 4 }} />;
  }
  const intensity = Math.pow(data.total / maxVal, 0.5);
  const bg = `rgba(${hexToRgb(accentColor)},${0.08 + intensity * 0.55})`;
  return (
    <div
      onClick={() => onClick && onClick(data)}
      style={{
        width: 52, height: 44,
        background: bg,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: `1px solid rgba(${hexToRgb(accentColor)},${0.1 + intensity * 0.4})`,
        transition: "transform 0.1s",
        padding: "2px 4px",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{data.total}</span>
      <StyleBar t={data.tango} v={data.vals} m={data.milonga} total={data.total} />
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function Tooltip({ cell, orchestra, decade, onClose }) {
  if (!cell) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: "#0f0f1a", border: "1px solid #334",
      borderRadius: 10, padding: "14px 18px", minWidth: 220,
      zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#a0a0c0", fontSize: 11 }}>{orchestra} · {decade}</span>
        <span onClick={onClose} style={{ cursor: "pointer", color: "#666" }}>✕</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{cell.total} songs</div>
      <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
        <div><span style={{ color: "#60a5fa" }}>■</span> Tango: {cell.tango}</div>
        <div><span style={{ color: "#a78bfa" }}>■</span> Vals: {cell.vals}</div>
        <div><span style={{ color: "#f97316" }}>■</span> Milonga: {cell.milonga}</div>
      </div>
    </div>
  );
}

export default function BorisGrid() {
  const [tooltip, setTooltip] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");

  const maxVal = Math.max(...GRID_DATA.rows.flatMap(r =>
    ACTIVE_DECADES.map(d => r.decades[d]?.total || 0)
  ));

  const filtered = filterLevel === "all"
    ? GRID_DATA.rows
    : GRID_DATA.rows.filter(r => r.level === filterLevel);

  // Group by level
  const byLevel = {};
  for (const row of filtered) {
    if (!byLevel[row.level]) byLevel[row.level] = [];
    byLevel[row.level].push(row);
  }

  return (
    <div style={{
      background: "#070710",
      minHeight: "100vh",
      padding: "24px 20px",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: "#e0e0f0",
      overflowX: "auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 2, color: "#fff", textTransform: "uppercase" }}>
            Boris Import
          </h1>
          <span style={{ fontSize: 11, color: "#556", letterSpacing: 1 }}>3,123 unique new songs · by orchestra × decade</span>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: "#778" }}>
            <span>Style bar:</span>
            <span style={{ color: "#60a5fa" }}>■ Tango</span>
            <span style={{ color: "#a78bfa" }}>■ Vals</span>
            <span style={{ color: "#f97316" }}>■ Milonga</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {["all","1","2","3","4","5"].map(l => (
              <button key={l} onClick={() => setFilterLevel(l)} style={{
                padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                background: filterLevel === l ? "#334" : "transparent",
                border: `1px solid ${filterLevel === l ? "#556" : "#223"}`,
                color: filterLevel === l ? "#fff" : "#556",
                fontFamily: "inherit",
              }}>
                {l === "all" ? "All" : `L${l}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {Object.entries(byLevel).sort((a,b) => a[0].localeCompare(b[0])).map(([level, rows]) => {
        const lc = LEVEL_COLORS[level];
        return (
          <div key={level} style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10, letterSpacing: 3, color: lc.accent, marginBottom: 8,
              textTransform: "uppercase", opacity: 0.8
            }}>
              {lc.label}
            </div>

            {/* Decade header row */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <div style={{ width: 160, flexShrink: 0 }} />
              <div style={{ display: "flex", gap: 3 }}>
                {ACTIVE_DECADES.map(d => (
                  <div key={d} style={{
                    width: 52, textAlign: "center",
                    fontSize: 9, color: "#445", letterSpacing: 0.5,
                    whiteSpace: "nowrap", overflow: "hidden",
                  }}>
                    {d === "Unknown" ? "???" : d}
                  </div>
                ))}
                <div style={{ width: 42, textAlign: "right", fontSize: 9, color: "#445" }}>TOTAL</div>
              </div>
            </div>

            {rows.map(row => (
              <div key={row.orchestra} style={{
                display: "flex", alignItems: "center", marginBottom: 3,
                padding: "2px 0",
              }}>
                {/* Orchestra name */}
                <div style={{
                  width: 160, flexShrink: 0, paddingRight: 10,
                  fontSize: 11, color: "#b0b0c8", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                  textAlign: "right",
                }}>
                  {row.orchestra}
                </div>

                {/* Decade cells */}
                <div style={{ display: "flex", gap: 3 }}>
                  {ACTIVE_DECADES.map(d => (
                    <Cell
                      key={d}
                      data={row.decades[d]}
                      maxVal={maxVal}
                      accentColor={lc.accent}
                      onClick={(data) => setTooltip({ cell: data, orchestra: row.orchestra, decade: d })}
                    />
                  ))}
                  {/* Total */}
                  <div style={{
                    width: 42, textAlign: "right",
                    fontSize: 12, fontWeight: 700,
                    color: lc.accent, paddingLeft: 6,
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                  }}>
                    {row.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Summary callout */}
      <div style={{
        marginTop: 16, padding: "12px 16px",
        background: "rgba(255,255,255,0.03)", borderRadius: 8,
        border: "1px solid #1a1a2e", fontSize: 11, color: "#556",
        display: "flex", gap: 24, flexWrap: "wrap",
      }}>
        <span>⚠ <span style={{ color: "#f97316" }}>Unknown</span> year = ~25% of songs missing date metadata</span>
        <span>⚠ <span style={{ color: "#f97316" }}>1990s–2010s</span> in golden-era orchs = reissue compilations</span>
        <span>✓ <span style={{ color: "#4ade80" }}>L1–L2 1930s–1960s</span> = high-value core targets</span>
        <span>✓ Color intensity ∝ √(count/max)</span>
      </div>

      {tooltip && (
        <Tooltip
          cell={tooltip.cell}
          orchestra={tooltip.orchestra}
          decade={tooltip.decade}
          onClose={() => setTooltip(null)}
        />
      )}
    </div>
  );
}
