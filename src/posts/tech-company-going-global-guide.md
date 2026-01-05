---
title: "The Complete Guide to Taking Your Tech Startup Global"
date: 2023-11-12
excerpt: A practical guide covering corporate structure, payment infrastructure, banking, team management, cloud services, and visa options for tech founders expanding to North America.
---

<img src="../images/tech-company-going-global.jpg" alt="Container ship representing global expansion" class="post-hero">

This guide is for tech founders, indie developers, and startup teams looking to expand into the North American market. The core strategy: export engineering resources as software services to North America, replicating the success model of cross-border e-commerce but for digital products.

## Corporate Structure

First, let's be clear about the core logic. When a tech company goes global targeting the North American market, you're essentially exporting domestic engineering resources in the form of software services and products. While many tech startups already operate as global teams with fully remote setups, the advantage of having bilingual capabilities and cross-cultural experience allows you to integrate engineering resources more efficiently than English-only companies. Think of Zoom's early model.

If you simply open a US company and hire only local American employees, there's no "going global" advantage. Since you're operating across two countries, you need corporate entities in both.

Here are my recommendations based on three considerations: **compliance, fundraising, and cost**.

### Compliance

Since you're primarily serving the North American market, operating as a Chinese company in the US creates regulatory risks. Consider TikTok's situation. My recommendation: **US company as primary, China company as subsidiary**. The China entity should hold 51%+ equity in the US company (this majority stake matters for L1 visa applications later).

### Fundraising

**Company Type**: Tech companies typically need to raise capital. Don't register as an LLC - while LLCs can technically raise money, it's complicated. Save yourself future headaches and register as a **C-CORP** directly.

**Fundraising Entity**: Raise through the US entity. You can approach VCs from both the US and China (one advantage of going global - you're not limited to domestic investors). For Chinese VCs, confirm they have USD funds available.

### Cost

Running two companies has costs. Given that North American engineer salaries are 4-5x higher than in China, here's the recommended division:

- **China company**: Engineering and R&D resources
- **US company**: Sales and growth resources

Creating a US C-CORP doesn't require an SSN or even physical presence in the US. Theory is viable - let's get practical.

## Practical Implementation

### Company Registration

**US Company**: Use [Stripe Atlas](https://stripe.com/atlas). Cost is $500 initially plus $100/year for management (bookkeeping, taxes). Processing takes 4-8 weeks - the company registers in 2 days, but getting your EIN from the IRS takes longer.

I previously used a small law firm for company registration but ended up closing that company. Trust issues aside, the annual accounting and tax work required constant follow-up. Stripe Atlas standardizes everything - all documents are in their system, annual fees auto-deduct, and if you need to dissolve the company later, it's just a button click.

**Important**: Register as a **Delaware C-CORP**. Delaware has the most developed corporate law - many other states copy it. If you've already been accepted into Microsoft for Startups Founders Hub, use their Stripe Atlas benefit for a $250 discount (half price).

**China Company**: DIY through local government portals or use an agency (~2-3K RMB). Have your accountant contact local commerce departments about foreign ownership registration. You'll need to transfer 51%+ personal shares to your US entity. Since you control both companies 100%, this is straightforward.

### Payment Collection

**Stripe Payments**: After Stripe Atlas registration, activate Stripe Payments in the same account. Complete KYC with passport info. Atlas registration provides benefits including fee waivers. Microsoft for Startups also offers $25K in Stripe fee credits.

Stripe should be your primary payment solution - it's the standard for SaaS companies globally. If your account gets banned, consider Lemon Squeezy or Paddle as backups.

**For Physical Products**: If you're doing cross-border e-commerce with actual inventory and buyer records, WorldFirst (backed by Ant Group) offers direct settlement to domestic Alipay accounts. Unfortunately, they don't support virtual products or SaaS - I specifically asked and was rejected.

### Banking

**Mercury Bank**: Positions itself as "Banks for Startups" (technically a financial institution partnering with banks). Low registration threshold, supports Checking + Savings accounts (park idle funds in Savings to earn interest), and offers API access.

Don't register directly on their website - go through Stripe Atlas Perks for benefits. If you deposit $20K within two months of opening, you get a $1K bonus. The Atlas link also bypasses EIN requirements during registration - Atlas automatically sends your EIN to Mercury once issued.

**Mercury's downside**: Only supports international wire transfers to domestic accounts, with high fees.

**Wise / Payoneer**: For repatriating funds to domestic bank accounts (despite unfavorable exchange rates and fees, still cheaper than international wire transfers). Typical flow: Mercury → ACH/Wire → Wise/Payoneer → domestic bank account.

For paying domestic employees, transfer to your China company's corporate account as parent-to-subsidiary payment, then handle taxes normally. Even for personal account transfers, report taxes properly - penalties are the least of your worries; jail time is possible.

**Risk management**: Keep funds distributed across Mercury, Wise, Payoneer, and domestic accounts. Learn from the Silicon Valley Bank collapse.

### Virtual Address & US Phone

**Stable** (usestable.com): Get a free virtual US address through Stripe Atlas Perks for your business mailing address. This physical address receives paper statements from IRS, banks, etc. The system lets you open and scan mail to digital format, or forward internationally.

Note: After KYC, electronically sign USPS Form 1583 to authorize mail handling. Some services like Mercury don't accept virtual addresses during registration - use your actual domestic address initially, then update the mailing address to Stable after onboarding.

**Google Voice**: Buy from resellers for a few dollars USD equivalent. Transfer to your Google account for normal calls and SMS verification. I used GV exclusively during my US trip to save on roaming charges.

### Team Management

**Email**: I use Feishu (Lark) enterprise email - free and works well. Just point your domain's MX records to their servers. Google Workspace is the typical choice for North American startups but it's paid.

**Knowledge Base**: Notion for documentation. Whimsical for flowcharts, mind maps, and whiteboard collaboration.

**IM**: Start with Discord - handles both community management and internal communication. Public channels for users, private groups for team. Move to Slack or Microsoft Teams once you exceed ~20 people.

### Cloud Services

**AI Startups**: Apply for Microsoft for Startups Founders Hub - get $2,500 in OpenAI credits plus up to $150K in Azure credits. AWS and GCP have similar startup programs. Don't spend your own money early - take every free credit available.

**Infrastructure**: Build on serverless from day one. Pay-as-you-go means near-zero costs with few users. Don't spin up EC2 reserved instances burning money while idle. Serverless also auto-scales - no manual capacity planning needed. Vercel and Cloudflare handle DevOps beautifully - push code and it deploys.

**Status Page**: Use Atlassian StatusPage (free tier) for service status monitoring.

### Other Services

Check Microsoft for Startups Founders Hub, Stripe Atlas Perks, and Mercury Perks before registering anything - most services offer benefits through these programs. This includes cap table management tools like Carta and AngelList for post-funding needs.

## Optimal Launch Path

Based on my experience, the fastest and cheapest path to launch a US company:

1. Purchase domain, set up landing page, polish your LinkedIn, create product demo video
2. Apply to Microsoft for Startups Founders Hub with LinkedIn authorization and product materials
3. Once approved, use Benefits → Stripe Atlas for $250 Delaware C-CORP registration (half price)
4. Register Mercury through Atlas Perks
5. After EIN arrives, register Wise/Payoneer and other services

## Visa Options

Running a US company can be fully remote initially. But as you scale, founders inevitably need to be on US soil - for roadshows, fundraising, hiring, office space. Until you have PR or citizenship, visas remain unavoidable.

### B1 Business Visa

**Overview**: Lowest barrier non-immigrant visa. Except for sensitive majors (STEM) or schools, you'll typically get 10-year multiple entry. Worst case with administrative processing: 1 year.

**Requirements**: Low - prove non-immigrant intent through domestic property, family ties, etc.

**Processing Time**: 2-6 months (mostly appointment wait time). DS-160 form, interview, and passport return take about a week.

**Stay Duration**: One week to six months per entry, typically under three months. Can apply for extension for business needs, but single stays cannot exceed one year. Frequent entries or stays over three months risk immigration intent suspicion and potential CBP refusal.

### L1 Visa

**Overview**: Allows international companies to transfer foreign employees to US parent/subsidiary/affiliate. L1A for managers/executives, L1B for specialized knowledge workers. This is why I recommend the China company holding 51%+ of the US entity.

**Requirements**: Medium - must have worked at the domestic company for 1+ years. Startups can apply but it's harder than for multinationals. The US office must demonstrate actual job creation.

**Processing Time**: 4-6 months standard, 15 business days with premium processing.

**Stay Duration**: L1A up to 7 years, L1B up to 5 years. Renewable in 2-year increments.

### IER (International Entrepreneur Rule)

**Overview**: Allows qualifying entrepreneurs and families to stay in the US to develop their startups. USCIS published official guidelines in March 2023 - still early days.

**Requirements**: Medium - US entity must have raised $250K+ in venture funding (some sources say $300K+ for safety).

**Processing Time**: 6+ months. Many immigration lawyers haven't handled these cases yet.

**Stay Duration**: Up to 5 years total - initial 30-month period, then 30-month extension if conditions met.

### O1 Visa

**Overview**: For individuals with extraordinary ability in sciences, arts, education, business, or athletics.

**Requirements**: High - must demonstrate extraordinary achievement. As a startup founder, acceptance into accelerators like YC, major media coverage, or national awards can qualify.

**Processing Time**: Weeks to months, premium processing available.

**Stay Duration**: Project-based, up to 3 years, unlimited renewals.

### H1B

Theoretically, founders can self-sponsor H1B. You'd need to prove you could be fired by the board - tricky when you own 50%+. Possible but complex. And with ~20% lottery odds annually, this should be a last resort.

### Key Notes

- Except B1 (DIY-able), hire immigration lawyers for other visas
- All non-immigrant visas have time limits. Plan your PR pathway early
- Apply as soon as you qualify - approvals take time
- Your ability to legally stay in the US is determined by the government, not your business activities

## Glossary

| Term | Definition |
|------|------------|
| PR | Permanent Resident (green card). Requires staying in US - single departures over 6 months risk revocation. Apply for re-entry permit for up to 2 years abroad. |
| STEM | Science, Technology, Engineering, Mathematics. These majors face administrative review ("check") on visa applications. |
| EIN | Employer Identification Number - your company's tax ID from the IRS. Required for Stripe, Mercury, Wise registration. Proof of US company ownership. |
| KYC | Know Your Customer - identity verification required by financial institutions. |
| ITIN | Individual Taxpayer Identification Number - for individuals without SSN. Useful for building US credit history early. |
| H1B | Work visa that many international students rely on post-graduation. Changing jobs is complicated. To recruit international talent, plan for sponsorship early. |

Building a global tech company is complex but achievable. Start with proper corporate structure, leverage every startup benefit available, and plan your immigration pathway early. The infrastructure has never been better for founders going global.
