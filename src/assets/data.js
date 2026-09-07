const modelList = [
  {
    id: "GL012A",
    name: "GL012A orange",

    models: {
      orange: "/models/GL012Aorange.glb",
      white: "/models/GL012Awhite.glb",
    },

    images: [
      "/pendant/GL012A/GL012A.jpg",
      "/pendant/GL012A/GL012A-2.jpg",
    ],

    specification: {
      color: ["white", "orange"],
      surfaceShape: ["circle", "rectangle"],
    },
  },
  {
    id: "bird",
    name: "bird",

    models: {
      default: "/models/bird.glb",
    },

    images: [
      "/pendant/bird/bird.jpg",
    ],

    specification: {
      surfaceShape: ["circle", "rectangle"],
    },
  },
  {
    id: "Autumn leaves Glass",
    name: "Autumn leaves Glass",

    models: {
      yellow: "/models/Autumn leaves Glassyellow.glb",
    },

    images: [
      "/pendant/autumn_leaves_glass/autumn_leaves_glass.png"
    ],

    specification: {
      color: ["yellow"],
      surfaceShape: ["circle", "rectangle"],
    },
  },
  {
    id: "IACC-GL014",
    name: "IACC-GL014",
    images: [
      "pendant/IACC-GL014/IACC-GL014.png"
    ],
    specification: {
      surfaceShape: ["circle", "rectangle"]
    }
  },
];




//sample data structure
// {
//   id: "c1",
//   name: "cylinder",
//   images: [
//     import.meta.env.BASE_URL + "/pendant/crystal1/crystal1.jpg",
//     import.meta.env.BASE_URL + "/pendant/crystal1/mock 1.jpg",
//     import.meta.env.BASE_URL + "/pendant/crystal1/mock 2.jpg",
//     import.meta.env.BASE_URL + "/pendant/crystal1/mock 3.jpg",
//     import.meta.env.BASE_URL + "/pendant/crystal1/mock 4.jpg",
//     import.meta.env.BASE_URL + "/pendant/crystal1/mock 5.jpg",
//   ],
//   specification:{
//     color: ["red","blue", "clear", "green"],
//     fitting: ["fit1","fit2"],
//     size: ["small", "large"]
//   }
// },
export default modelList;