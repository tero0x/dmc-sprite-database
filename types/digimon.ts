export interface DigimonImage {
  url: string
  name: string
}

export interface DigimonData {
  name: string
  stage: string
  attribute: string
  format: number
  donation_link: string
  type: string
  author: string
  images: string[]
  size?: string // Add the size property as optional since it might not be in all data
  style?: string // Add the style property as optional
  source?: string // Add the source property as optional
}
