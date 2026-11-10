import type { Order } from '@/payload-types'

// Email HTML semplici, con stili in linea (molti client email ignorano i CSS esterni)

const C = { paper: '#e9dcc6', ink: '#1f2a44', soft: '#4a4f5f', red: '#d90f1f' }

const eur = (cents: number | null | undefined, locale: string) =>
  new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(
    (cents ?? 0) / 100,
  )

const esc = (s: string | null | undefined) =>
  (s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function layout(body: string) {
  return `<!doctype html><html><body style="margin:0;background:${C.paper};font-family:Georgia,serif;color:${C.ink}">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:32px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f6efe2;border-radius:8px;padding:32px">
<tr><td style="font-size:22px;color:${C.red};padding-bottom:24px">Amazing Mandala</td></tr>
<tr><td style="font-size:16px;line-height:1.6">${body}</td></tr>
</table></td></tr></table></body></html>`
}

function summary(order: Order, locale: string) {
  const it = locale === 'it'
  const rows = (order.items ?? [])
    .map((i) => `<tr><td style="padding:6px 0">${esc(i.title)}</td><td align="right">${eur(i.priceCents, locale)}</td></tr>`)
    .join('')
  const shipping = order.shipping ? eur(order.shipping, locale) : it ? 'Gratuita' : 'Free'
  const a = order.shippingAddress
  const address = [a?.name, a?.line1, a?.line2, [a?.postalCode, a?.city, a?.state].filter(Boolean).join(' '), a?.country]
    .filter(Boolean)
    .map(esc)
    .join('<br>')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #d8cbb3;border-bottom:1px solid #d8cbb3;margin:16px 0">
${rows}
<tr><td style="padding:6px 0;color:${C.soft}">${it ? 'Spedizione' : 'Shipping'}</td><td align="right">${shipping}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold">${it ? 'Totale' : 'Total'}</td><td align="right" style="font-weight:bold">${eur(order.total, locale)}</td></tr>
</table>
<p style="color:${C.soft};margin:0 0 4px">${it ? 'Indirizzo di spedizione' : 'Shipping address'}</p>
<p style="margin:0">${address}</p>`
}

export function customerConfirmation(order: Order) {
  const locale = order.locale === 'en' ? 'en' : 'it'
  const it = locale === 'it'
  const subject = it ? `Ordine ${order.orderNumber} confermato` : `Order ${order.orderNumber} confirmed`
  const html = layout(`
<p style="font-size:20px;margin:0 0 16px">${it ? 'Grazie per il tuo acquisto' : 'Thank you for your purchase'}${order.customerName ? `, ${esc(order.customerName.split(' ')[0])}` : ''}.</p>
<p>${it ? `Abbiamo ricevuto il pagamento dell'ordine <strong>${order.orderNumber}</strong>. Il quadro verrà imballato con cura e spedito con BRT: appena parte ti mandiamo il numero di tracking.` : `We've received payment for order <strong>${order.orderNumber}</strong>. The piece will be carefully packed and shipped with BRT: we'll send you the tracking number as soon as it leaves.`}</p>
${summary(order, locale)}
<p style="color:${C.soft};font-size:14px;margin-top:24px">${it ? 'Per qualsiasi domanda rispondi a questa email.' : 'If you have any questions, just reply to this email.'}</p>`)
  return { subject, html }
}

export function ownerNotification(order: Order, adminUrl: string) {
  const subject = `Nuovo ordine ${order.orderNumber}: ${eur(order.total, 'it')}`
  const html = layout(`
<p style="font-size:20px;margin:0 0 16px">Nuovo ordine da spedire</p>
<p><strong>${esc(order.customerName)}</strong> · ${esc(order.email)}${order.phone ? ` · ${esc(order.phone)}` : ''}</p>
${summary(order, 'it')}
<p style="margin-top:24px"><a href="${adminUrl}" style="color:${C.red}">Apri l'ordine nel pannello</a></p>`)
  return { subject, html }
}

export function shippedNotification(order: Order) {
  const locale = order.locale === 'en' ? 'en' : 'it'
  const it = locale === 'it'
  const link = order.trackingUrl || 'https://www.brt.it/'
  const subject = it ? `Il tuo ordine ${order.orderNumber} è partito` : `Your order ${order.orderNumber} has shipped`
  const html = layout(`
<p style="font-size:20px;margin:0 0 16px">${it ? 'Il tuo quadro è in viaggio' : 'Your piece is on its way'}${order.customerName ? `, ${esc(order.customerName.split(' ')[0])}` : ''}.</p>
<p>${it ? `Abbiamo affidato l'ordine <strong>${order.orderNumber}</strong> a BRT. Numero di spedizione:` : `We've handed order <strong>${order.orderNumber}</strong> to BRT. Tracking number:`}</p>
<p style="font-size:20px;letter-spacing:1px;margin:8px 0 16px"><strong>${esc(order.trackingNumber)}</strong></p>
<p><a href="${esc(link)}" style="display:inline-block;background:${C.ink};color:#f6efe2;text-decoration:none;padding:10px 18px;border-radius:6px">${it ? 'Segui la spedizione' : 'Track your parcel'}</a></p>
${summary(order, locale)}
<p style="color:${C.soft};font-size:14px;margin-top:24px">${it ? 'Per qualsiasi domanda rispondi a questa email.' : 'If you have any questions, just reply to this email.'}</p>`)
  return { subject, html }
}
