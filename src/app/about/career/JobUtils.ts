// Exportable job descriptions for the /career page
export var JobCardInfo = [
  {
    imageUrl: '/pilytix-logo.png',
    company: 'PILYTIX',
    link: 'www.pilytix.ai',
    jobKey: 'pilytix',
  },
  {
    imageUrl: 'frost-bank-logo.png',
    company: 'Frost Bank',
    link: 'www.frostbank.com',
    jobKey: 'frost',
  },
  {
    imageUrl: '/ksat-logo.png',
    company: 'KSAT News',
    link: 'www.ksat.com',
    jobKey: 'ksat',
  },
  {
    imageUrl: '/Spurs_Sports_&_Entertainment-logo.png',
    company: 'Spurs Sports & Entertainment',
    link: 'www.frostbankcenter.com',
    jobKey: 'spurs',
  },
];

export var JobDescriptions: {
  [jobKey: string]: {
    title: string;
    skills: string;
    duration: string;
    description: string[];
    image: string;
  }[];
} = {
  pilytix: [
    {
      title: 'Frontend Engineer & Data Scientist',
      skills:
        'JavaScript, React, TailwindCSS, PostgreSQL, Python, R, Java, Shiny',
      duration: 'Jan 2024 - Present',
      description: [
        'Manage and improve UI/UX for all PX products, including Audience Builder CDP, Pipeline Accelerator, and Dynamic Lead Scores, through Test-Driven Development',
        'Develop and manage AI & CDP solutions for 3 professional sports teams, 2 universities',
      ],
      image: '',
    },
    {
      title: 'Data Scientist',
      skills: 'PostgreSQL, Python, R, Java, Shiny',
      duration: 'Dec 2021 - Dec 2023',
      description: [
        'Developed predictive models for three professional sports teams leading to 2.6x overall win rate improvement and 37 day decrease in cycle time',
        'Produce internal Chiny application to visualize and streamline Data Science workflow',
      ],
      image: '',
    },
  ],
  frost: [
    {
      title: 'Data Analytics Intern',
      skills: 'Tableau, SQL, Splunk',
      duration: 'May 2021 - Dec 2021',
      description: [
        'Utilize SQL to collect and analyze data',
        'Create live, detailed Tableau visualizations for Frost product owners',
        'Develop unique Splunk dashboards to understand consumer trends on the Frost Bank app',
      ],
      image: '',
    },
  ],
  ksat: [
    {
      title: 'Data Analytics Intern',
      skills: 'Python, Tableau',
      duration: 'Jan 2021 - May 2021',
      description: [
        'Created Tableau visualizations for digital publications',
        'Used Python to develop regressions and neural networks to optimize company performance',
        'Provided feedback on news reports and general system operations',
        'Scraped and formatted political contribution data from the Texas Ethics Commission for digital publications',
        'Utilize Dash, Flask, HTML, and Python to develop an adaptable dashboard application',
      ],
      image: '',
    },
  ],
  spurs: [
    {
      title: '50/50 Raffle Representative',
      skills: 'Communication, Sales Efficiency',
      duration: 'Aug 2019 - Jul 2020',
      description: [
        "Fan engagement and hospitality to bolster every SS&E fan's game experience",
        'Sale of 50/50 raffle tickets with the goal of raising funds for the Spurs Give charity',
        'Raised $14,820 for Spurs Give ($823.33/game avg)',
        'Top 5 on staff in raffle revenue generated, attendance, and avg $ raised per game',
      ],
      image: '',
    },
  ],
};
