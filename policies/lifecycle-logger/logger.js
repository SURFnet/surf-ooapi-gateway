/* Copyright (C) 2021 SURFnet B.V.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program. If not, see http://www.gnu.org/licenses/.
 */

const jsonLog = require('../../lib/json_log')
const xroute = require('../../lib/xroute')
const ensureTraceParent = require('../../lib/ensure_traceparent')

module.exports = () => {
  return (req, res, next) => {
    const traceParent = ensureTraceParent(req)
    const reqTimerStart = new Date()
    const method = req.method
    const url = req.originalUrl
    const routes = xroute.decode(req.headers['x-route'])

    res.on('finish', () => {
      const app = req.egContext.app // set by gatekeeper policy
      const reqTimerEnd = new Date()
      const statusCode = res.statusCode
      const infoProps = {
        side: 'client',
        short_message: `${req.traceparent.traceId} - ${method} ${url} ${statusCode}`,
        traceparent_trace_id: traceParent.traceId,
        traceparent_id: traceParent.id,
        traceparent_parent_id: traceParent.parent_id,
        client: app,
        route_path: req.route && req.route.path,
        http_status: statusCode,
        request_method: method,
        url,
        time_ms: reqTimerEnd - reqTimerStart,
        num_x_routes: routes ? routes.length : 0
      }

      if (res.error_msg) {
        // We also use `error_msg` for Bad Gateway errors in
        // aggegration policy.
        infoProps.error_msg = res.error_msg
      }

      jsonLog.info(infoProps)
    })

    next()
  }
}
