const Debug = require('debug')
const Set = require('./sets.js')
const { updateColor, updateColorDirect } = require('./updatecolor.js')
const { useDirect } = require('./config.json')

const log = Debug('role')
const verboseLog = Debug('role-built')

function ManagedRole (role) {
    log(`trying to manage role ${role.id} (${role.name})`)

    let scheme
    let lastRoleName = ''

    function buildScheme () {
        if (!/^[a-zA-Zа-яА-Я]+$/i.test(role.name)) {
            log(`role ${role.id} (${role.name}) does not match /^rainbow-[a-zA-Z-]+$/i`)
            throw new Error('Role not manageable')
        }
        verboseLog(`role ${role.id} (${role.name}) on guild ${role.guild.id} ${role.guild.name} is being compiled`)
        scheme = Set(role.name.replace(/^~-/i, ''))
        if (!scheme) {
            verboseLog(`role ${role.id} (${role.name}) did not compile`)
            log(`role ${role.id} (${role.name}) is not a valid set`)
            throw new Error('Role does not have a valid set')
        }
        verboseLog(`role ${role.id} (${role.name}) compiled successfully!`)
        log(`role ${role.id} (${role.name}) has built a scheme and is manageable`)
        lastRoleName = role.name
    }
    buildScheme()

    let index = -1

    async function update () {
        if (lastRoleName !== role.name) buildScheme()
        log(`updating role ${role.id} (${role.name})`)
        index++
        if (index >= scheme.length) index = 0
        if (index < 0) index = 0
        if (!useDirect) await updateColor(role, scheme[index])
        else await updateColorDirect(role.guild.id, role.id, scheme[index])
    }

    Object.defineProperties(this, {
        scheme: { value: scheme },
        role: { value: role },
        update: { value: update }
    })
}
Object.freeze(ManagedRole)

module.exports = ManagedRole
