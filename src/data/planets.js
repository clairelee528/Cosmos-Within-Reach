/**
 * Static content and visual configuration for the eight major planets.
 * Distances and sizes are adjusted in the scene section for a usable overview;
 * astronomy facts retain their real-world units for the knowledge interface.
 */
export const planets = [
  {
    id: 'mercury',
    name: { zh: '水星', en: 'Mercury' },
    type: { zh: '类地行星', en: 'Terrestrial Planet' },
    texture: '/textures/mercury_albedo_4k.png',
    scene: {
      radius: 0.38,
      orbitRadius: 2.4,
      orbitSpeed: 0.11,
      rotationSpeed: 0.001,
      initialAngle: 5.75,
      fallbackColor: 0x8a8178,
    },
    facts: {
      diameterKm: 4879,
      distanceFromSunMillionKm: 57.9,
      orbitalPeriodDays: 87.97,
      averageTemperatureC: 167,
    },
    description:
      '水星是距离太阳最近、也是太阳系中最小的行星。它几乎没有能够保存热量的大气层，因此昼夜温差极大。',
    highlights: [
      '绕太阳运行一周只需要约 88 个地球日。',
      '表面遍布由撞击形成的环形山。',
      '白天和夜晚的温度差可超过 600 摄氏度。',
    ],
  },
  {
    id: 'venus',
    name: { zh: '金星', en: 'Venus' },
    type: { zh: '类地行星', en: 'Terrestrial Planet' },
    texture: '/textures/venus_albedo_4k.png',
    scene: {
      radius: 0.64,
      orbitRadius: 3.2,
      orbitSpeed: 0.09,
      rotationSpeed: -0.0015,
      initialAngle: 4.7,
      fallbackColor: 0xc99b62,
    },
    facts: {
      diameterKm: 12104,
      distanceFromSunMillionKm: 108.2,
      orbitalPeriodDays: 224.7,
      averageTemperatureC: 464,
    },
    description:
      '金星的大小与地球相近，但浓厚的二氧化碳大气造成了强烈的温室效应，使它成为太阳系中最热的行星。',
    highlights: [
      '自转方向与太阳系中大多数行星相反。',
      '云层主要由硫酸液滴组成。',
      '金星的一天比它的一年还要长。',
    ],
  },
  {
    id: 'earth',
    name: { zh: '地球', en: 'Earth' },
    type: { zh: '类地行星', en: 'Terrestrial Planet' },
    texture: '/textures/earth_albedo_4k.png',
    scene: {
      radius: 0.68,
      orbitRadius: 4,
      orbitSpeed: 0.08,
      rotationSpeed: 0.004,
      initialAngle: 0.2,
      fallbackColor: 0x3979bd,
      clouds: {
        texture: '/textures/earth_clouds_4k.png',
        scale: 1.018,
        rotationSpeed: 0.0007,
        opacity: 0.82,
      },
    },
    facts: {
      diameterKm: 12742,
      distanceFromSunMillionKm: 149.6,
      orbitalPeriodDays: 365.25,
      averageTemperatureC: 15,
    },
    description:
      '地球是距离太阳第三近的行星，也是目前已知唯一拥有生命的世界。液态水、稳定的大气层和适宜的温度共同塑造了它独特的生态环境。',
    highlights: [
      '约 71% 的地表被海洋覆盖。',
      '拥有一颗天然卫星——月球。',
      '大气层主要由氮气和氧气组成。',
    ],
  },
  {
    id: 'mars',
    name: { zh: '火星', en: 'Mars' },
    type: { zh: '类地行星', en: 'Terrestrial Planet' },
    texture: '/textures/mars_albedo_4k.png',
    scene: {
      radius: 0.52,
      orbitRadius: 5.5,
      orbitSpeed: 0.065,
      rotationSpeed: 0.003,
      initialAngle: 1.35,
      fallbackColor: 0xb6573f,
    },
    facts: {
      diameterKm: 6779,
      distanceFromSunMillionKm: 227.9,
      orbitalPeriodDays: 687,
      averageTemperatureC: -63,
    },
    description:
      '火星是一颗寒冷而干燥的沙漠行星。它的岩石与尘埃富含氧化铁，因此从太空中看呈现出醒目的红色。',
    highlights: [
      '拥有火卫一和火卫二两颗小卫星。',
      '奥林帕斯山是太阳系中已知最高的火山。',
      '地表保留着远古河流和湖泊留下的痕迹。',
    ],
  },
  {
    id: 'jupiter',
    name: { zh: '木星', en: 'Jupiter' },
    type: { zh: '气态巨行星', en: 'Gas Giant' },
    texture: '/textures/jupiter_albedo_4k.png',
    scene: {
      radius: 1.35,
      orbitRadius: 7.3,
      orbitSpeed: 0.045,
      rotationSpeed: 0.008,
      initialAngle: 2.55,
      fallbackColor: 0xc99c72,
    },
    facts: {
      diameterKm: 139820,
      distanceFromSunMillionKm: 778.5,
      orbitalPeriodDays: 4333,
      averageTemperatureC: -110,
    },
    description:
      '木星是太阳系中体积最大的行星。它主要由氢和氦构成，快速自转的大气形成了色彩分明的云带和巨大风暴。',
    highlights: [
      '大红斑是一场持续了数百年的巨大风暴。',
      '体积足以容纳约 1300 个地球。',
      '拥有微弱的行星环和庞大的卫星系统。',
    ],
  },
  {
    id: 'saturn',
    name: { zh: '土星', en: 'Saturn' },
    type: { zh: '气态巨行星', en: 'Gas Giant' },
    texture: '/textures/saturn_albedo_4k.png',
    scene: {
      radius: 1.2,
      orbitRadius: 9.2,
      orbitSpeed: 0.035,
      rotationSpeed: 0.007,
      initialAngle: 3.75,
      fallbackColor: 0xd8c28f,
      ring: {
        innerRadius: 1.45,
        outerRadius: 2.2,
        texture: '/textures/saturn_ring_4k.png',
      },
    },
    facts: {
      diameterKm: 116460,
      distanceFromSunMillionKm: 1434,
      orbitalPeriodDays: 10759,
      averageTemperatureC: -178,
    },
    description:
      '土星是太阳系第六颗行星，以宽广而明亮的行星环闻名。它和木星一样，主要由氢和氦组成。',
    highlights: [
      '行星环主要由冰粒、岩石和尘埃组成。',
      '平均密度低于水。',
      '土卫六是太阳系中第二大的卫星。',
    ],
  },
  {
    id: 'uranus',
    name: { zh: '天王星', en: 'Uranus' },
    type: { zh: '冰巨行星', en: 'Ice Giant' },
    texture: '/textures/uranus_albedo_4k.png',
    scene: {
      radius: 0.92,
      orbitRadius: 10.3,
      orbitSpeed: 0.029,
      rotationSpeed: -0.005,
      initialAngle: 0.9,
      fallbackColor: 0x82c7d3,
    },
    facts: {
      diameterKm: 50724,
      distanceFromSunMillionKm: 2872.5,
      orbitalPeriodDays: 30687,
      averageTemperatureC: -195,
    },
    description:
      '天王星是一颗颜色淡蓝的冰巨行星。它的自转轴几乎平躺在轨道平面上，看起来像侧躺着绕太阳运行。',
    highlights: [
      '自转轴倾角约为 98 度。',
      '拥有暗淡的行星环系统。',
      '大气主要由氢、氦和甲烷组成。',
    ],
  },
  {
    id: 'neptune',
    name: { zh: '海王星', en: 'Neptune' },
    type: { zh: '冰巨行星', en: 'Ice Giant' },
    texture: '/textures/neptune_albedo_4k.png',
    scene: {
      radius: 0.88,
      orbitRadius: 11.2,
      orbitSpeed: 0.025,
      rotationSpeed: 0.006,
      initialAngle: 5.15,
      fallbackColor: 0x386bc4,
    },
    facts: {
      diameterKm: 49244,
      distanceFromSunMillionKm: 4495.1,
      orbitalPeriodDays: 60190,
      averageTemperatureC: -200,
    },
    description:
      '海王星是太阳系中距离太阳最远的主要行星。大气中的甲烷吸收红光，使它呈现出深邃的蓝色。',
    highlights: [
      '拥有太阳系中速度最快的行星风。',
      '完成一次公转大约需要 165 个地球年。',
      '海卫一沿着与海王星自转相反的方向运行。',
    ],
  },
];

export function getPlanetById(planetId) {
  return planets.find((planet) => planet.id === planetId) ?? null;
}
